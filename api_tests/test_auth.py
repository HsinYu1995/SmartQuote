import requests


def test_register_missing_fields(base_url):
    session = requests.Session()
    resp = session.post(f"{base_url}/api/auth/register", json={"email": "x@x.com"})
    assert resp.status_code == 400
    assert "message" in resp.json()


def test_register_short_password(base_url):
    resp = requests.post(
        f"{base_url}/api/auth/register",
        json={
            "name": "Test",
            "email": "short@x.com",
            "password": "abc",
            "licenseNumber": "L-001",
            "agency": "Acme",
        },
    )
    assert resp.status_code == 400
    assert "6 characters" in resp.json()["message"]


def test_login_missing_fields(base_url):
    resp = requests.post(f"{base_url}/api/auth/login", json={"email": "x@x.com"})
    assert resp.status_code == 400


def test_login_wrong_password(base_url):
    resp = requests.post(
        f"{base_url}/api/auth/login",
        json={"email": "alex.johnson@smartquote.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401
    assert resp.json()["message"] == "Invalid email or password"


def test_login_nonexistent_user(base_url):
    resp = requests.post(
        f"{base_url}/api/auth/login",
        json={"email": "nobody@nowhere.com", "password": "password123"},
    )
    assert resp.status_code == 401


def test_me_requires_auth(base_url):
    resp = requests.get(f"{base_url}/api/auth/me")
    assert resp.status_code == 401


def test_me_returns_broker(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/auth/me")
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "pytest_api_tester@smartquote.test"
    assert "id" in body
    assert "name" in body
    assert "password" not in body
    assert "password_hash" not in body


def test_logout_clears_session(base_url):
    session = requests.Session()
    # Log in with the demo broker that ships with seed data
    login = session.post(
        f"{base_url}/api/auth/login",
        json={"email": "alex.johnson@smartquote.com", "password": "demo1234"},
    )
    assert login.status_code == 200

    # Confirm authenticated
    me = session.get(f"{base_url}/api/auth/me")
    assert me.status_code == 200

    # Log out
    logout = session.post(f"{base_url}/api/auth/logout")
    assert logout.status_code == 200
    assert logout.json() == {"ok": True}

    # Cookie should be cleared — protected route now returns 401
    after = session.get(f"{base_url}/api/auth/me")
    assert after.status_code == 401


def test_protected_route_without_cookie(base_url):
    resp = requests.get(f"{base_url}/api/quotes")
    assert resp.status_code == 401
    assert resp.json()["message"] == "Authentication required"
