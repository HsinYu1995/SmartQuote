def test_list_clients_returns_data(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/clients")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert isinstance(body["data"], list)
    assert len(body["data"]) >= 1


def test_list_clients_has_expected_fields(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/clients")
    assert resp.status_code == 200
    client = resp.json()["data"][0]
    for field in ("id", "firstName", "lastName", "email", "quoteCount", "latestQuoteAt"):
        assert field in client, f"Missing field: {field}"


def test_list_clients_search_by_name(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/clients?search=Testclient")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) >= 1
    names = [f"{c['firstName']} {c['lastName']}" for c in data]
    assert any("Testclient" in n for n in names)


def test_list_clients_search_no_match(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/clients?search=zzznomatch999")
    assert resp.status_code == 200
    assert resp.json()["data"] == []


def test_list_clients_broker_isolation(auth_session, base_url, created_quote):
    """Clients linked only to other brokers' quotes must not appear."""
    resp = auth_session.get(f"{base_url}/api/clients")
    assert resp.status_code == 200
    # The demo broker's clients should not leak into the test broker's list
    emails = [c["email"] for c in resp.json()["data"]]
    assert "alex.johnson@smartquote.com" not in emails


def test_get_client_quotes(auth_session, base_url, created_quote):
    client_id = created_quote["client"]["id"]
    resp = auth_session.get(f"{base_url}/api/clients/{client_id}/quotes")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert len(body["data"]) >= 1
    assert all(q["client"]["id"] == client_id for q in body["data"])


def test_get_client_quotes_requires_auth(base_url, created_quote):
    import requests

    client_id = created_quote["client"]["id"]
    resp = requests.get(f"{base_url}/api/clients/{client_id}/quotes")
    assert resp.status_code == 401
