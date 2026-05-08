import requests


def test_health_returns_ok(base_url):
    resp = requests.get(f"{base_url}/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


def test_health_no_auth_required(base_url):
    resp = requests.get(f"{base_url}/api/health")
    assert resp.status_code == 200
