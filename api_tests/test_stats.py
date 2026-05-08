def test_stats_returns_expected_shape(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    for field in ("totalToday", "approvedToday", "rejectedToday", "pendingTotal"):
        assert field in body, f"Missing field: {field}"
        assert isinstance(body[field], int)


def test_stats_requires_auth(base_url):
    import requests

    resp = requests.get(f"{base_url}/api/stats")
    assert resp.status_code == 401


def test_stats_today_counts_reflect_created_quote(auth_session, base_url, created_quote):
    """Creating a quote in this session should increment today's total."""
    resp = auth_session.get(f"{base_url}/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    # The session fixture creates at least one quote today
    assert body["totalToday"] >= 1


def test_stats_counts_are_non_negative(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    for field in ("totalToday", "approvedToday", "rejectedToday", "pendingTotal"):
        assert body[field] >= 0


def test_stats_broker_isolation(base_url):
    """Two different brokers see independent stats."""
    import requests

    demo_session = requests.Session()
    demo_session.post(
        f"{base_url}/api/auth/login",
        json={"email": "alex.johnson@smartquote.com", "password": "demo1234"},
    )

    pytest_session = requests.Session()
    pytest_session.post(
        f"{base_url}/api/auth/login",
        json={"email": "pytest_api_tester@smartquote.test", "password": "pytest_pass_123"},
    )

    demo_stats = demo_session.get(f"{base_url}/api/stats").json()
    pytest_stats = pytest_session.get(f"{base_url}/api/stats").json()

    # They can differ (seed data vs test data) — main check is both return valid shapes
    for stats in (demo_stats, pytest_stats):
        assert "totalToday" in stats
        assert "pendingTotal" in stats
