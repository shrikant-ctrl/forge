import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module", autouse=True)
def setup_teardown():
    with TestClient(app) as client:
        yield client


def test_health_check(setup_teardown):
    client = setup_teardown
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "connected"


def test_auth_and_module_flow(setup_teardown):
    client = setup_teardown
    unique_email = "engineer@example.com"

    # 1. Register
    reg_res = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "SuperSecretPassword123!", "name": "Staff Engineer"},
    )
    # If user exists from previous test run, status could be 409 or 201
    assert reg_res.status_code in (201, 409)

    # 2. Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "SuperSecretPassword123!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "accessToken" in token_data
    token = token_data["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get /me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

    # 4. Create Folder
    folder_res = client.post(
        "/api/folders",
        headers=headers,
        json={"name": "Engineering Specs"},
    )
    assert folder_res.status_code == 201
    folder = folder_res.json()
    assert folder["name"] == "Engineering Specs"
    folder_id = folder["id"]

    # 5. List Folders
    list_folders_res = client.get("/api/folders", headers=headers)
    assert list_folders_res.status_code == 200
    folders = list_folders_res.json()
    assert any(f["id"] == folder_id for f in folders)

    # 6. Init File Upload
    upload_res = client.post(
        "/api/files/init-upload",
        headers=headers,
        json={
            "name": "architecture_v1.pdf",
            "sizeBytes": 1048576,
            "mimeType": "application/pdf",
            "folderId": folder_id,
        },
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert "uploadUrl" in upload_data
    assert "fileId" in upload_data

    # 7. Verify NestJS-style ExceptionFilter for 404
    err_res = client.get("/api/folders/00000000-0000-0000-0000-000000000000", headers=headers)
    assert err_res.status_code == 404
    err_json = err_res.json()
    assert err_json["statusCode"] == 404
    assert "message" in err_json
    assert "timestamp" in err_json
    assert "path" in err_json


def test_refresh_token_flow(setup_teardown):
    client = setup_teardown
    unique_email = "refresh-flow@example.com"

    client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "SuperSecretPassword123!", "name": "Refresh Flow"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "SuperSecretPassword123!"},
    )
    assert login_res.status_code == 200
    tokens = login_res.json()
    assert "refreshToken" in tokens
    old_refresh_token = tokens["refreshToken"]

    # 1. Rejects an unknown refresh token
    bad_res = client.post("/api/auth/refresh", json={"refreshToken": "not-a-real-token"})
    assert bad_res.status_code == 401

    # 2. Rotates a valid refresh token for a new pair
    refresh_res = client.post("/api/auth/refresh", json={"refreshToken": old_refresh_token})
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert new_tokens["refreshToken"] != old_refresh_token
    assert new_tokens["accessToken"]

    # 3. Reusing the now-rotated (revoked) token is rejected
    reuse_res = client.post("/api/auth/refresh", json={"refreshToken": old_refresh_token})
    assert reuse_res.status_code == 401

    # 4. Reuse detection also revokes the token issued by the rotation (whole session tree killed)
    rotated_again_res = client.post("/api/auth/refresh", json={"refreshToken": new_tokens["refreshToken"]})
    assert rotated_again_res.status_code == 401

    # 5. Logout revokes a still-valid refresh token
    login_res_2 = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "SuperSecretPassword123!"},
    )
    tokens_2 = login_res_2.json()
    headers_2 = {"Authorization": f"Bearer {tokens_2['accessToken']}"}

    logout_res = client.post(
        "/api/auth/logout",
        headers=headers_2,
        json={"refreshToken": tokens_2["refreshToken"]},
    )
    assert logout_res.status_code == 204

    post_logout_refresh_res = client.post("/api/auth/refresh", json={"refreshToken": tokens_2["refreshToken"]})
    assert post_logout_refresh_res.status_code == 401
