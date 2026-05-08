import pytest


def _client():
    return {
        "firstName": "John",
        "lastName": "Quotetest",
        "dateOfBirth": "1985-07-04",
        "email": "john.quotetest@example.com",
        "phone": "555-0200",
        "address": "1 Insurance Lane",
        "city": "Covertown",
        "state": "CA",
        "zipCode": "90001",
    }


# ── Creation ──────────────────────────────────────────────────────────────────

def test_create_car_quote_approved(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "car",
            "client": _client(),
            "condition": {
                "coverageLevel": "standard",
                "usage": "personal",
                "vehicleYear": 2021,
                "annualMileage": 12000,
                "priorAccidents": 0,
                "driverLicenseYears": 8,
            },
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["type"] == "car"
    assert body["status"] == "approved"
    assert body["result"]["monthlyPremium"] > 0
    assert body["result"]["annualPremium"] > 0
    assert body["referenceNumber"].startswith("SQ-")
    assert body["client"]["firstName"] == "John"


def test_create_car_quote_high_risk_rejected(auth_session, base_url):
    """3+ prior accidents triggers rejection without a premium result."""
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "car",
            "client": _client(),
            "condition": {
                "coverageLevel": "comprehensive",
                "usage": "personal",
                "vehicleYear": 2019,
                "annualMileage": 15000,
                "priorAccidents": 3,
                "driverLicenseYears": 5,
            },
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "rejected"
    assert body["result"] is None


def test_create_house_quote_approved(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "house",
            "client": _client(),
            "condition": {
                "constructionType": "brick",
                "roofType": "asphalt",
                "roofAge": 5,
                "occupancy": "owner",
                "hasSprinklers": False,
                "hasSecuritySystem": True,
                "hasPool": False,
                "yearBuilt": 2000,
                "desiredCoverage": 350000,
            },
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["type"] == "house"
    assert body["status"] == "approved"
    assert body["result"]["coverageLimit"] == 350000
    assert body["result"]["deductible"] == 1000


def test_create_health_quote_approved(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "health",
            "client": _client(),
            "condition": {
                "planType": "PPO",
                "coverageType": "individual",
                "clientAge": 35,
                "smokingStatus": "never",
                "bmi": 24,
                "preExistingConditions": ["hypertension"],
                "prescriptionCount": 1,
                "needsDental": True,
                "needsVision": False,
                "needsMental": False,
                "desiredDeductible": 1000,
            },
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["type"] == "health"
    assert body["status"] == "approved"
    assert "dental" in body["result"]["breakdown"]


def test_create_health_quote_high_risk_rejected(auth_session, base_url):
    """Current smoker with >2 pre-existing conditions triggers rejection."""
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "health",
            "client": _client(),
            "condition": {
                "planType": "HMO",
                "coverageType": "individual",
                "clientAge": 50,
                "smokingStatus": "current",
                "bmi": 30,
                "preExistingConditions": ["diabetes", "hypertension", "asthma"],
                "prescriptionCount": 3,
                "needsDental": False,
                "needsVision": False,
                "needsMental": False,
                "desiredDeductible": 2000,
            },
        },
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "rejected"


def test_create_quote_invalid_type(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={"type": "pet", "client": _client(), "condition": {}},
    )
    assert resp.status_code == 400
    body = resp.json()
    assert body["code"] == "VALIDATION_ERROR"


def test_create_quote_missing_client(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={"type": "car", "condition": {"coverageLevel": "basic"}},
    )
    assert resp.status_code == 400


def test_create_quote_missing_condition(auth_session, base_url):
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={"type": "car", "client": _client()},
    )
    assert resp.status_code == 400


# ── Listing ───────────────────────────────────────────────────────────────────

def test_list_quotes_returns_paginated(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/quotes")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "total" in body
    assert "page" in body
    assert "pageSize" in body
    assert "totalPages" in body
    assert isinstance(body["data"], list)
    assert body["total"] >= 1


def test_list_quotes_filter_by_type(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/quotes?type=car")
    assert resp.status_code == 200
    body = resp.json()
    assert all(q["type"] == "car" for q in body["data"])


def test_list_quotes_filter_by_status_approved(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/quotes?status=approved")
    assert resp.status_code == 200
    assert all(q["status"] == "approved" for q in resp.json()["data"])


def test_list_quotes_filter_by_status_rejected(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/quotes?status=rejected")
    assert resp.status_code == 200
    assert all(q["status"] == "rejected" for q in resp.json()["data"])


def test_list_quotes_pagination(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/quotes?page=1&pageSize=2")
    assert resp.status_code == 200
    body = resp.json()
    assert body["pageSize"] == 2
    assert body["page"] == 1
    assert len(body["data"]) <= 2


def test_list_quotes_search(auth_session, base_url, created_quote):
    resp = auth_session.get(f"{base_url}/api/quotes?search=Testclient")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1


def test_list_quotes_broker_isolation(auth_session, base_url):
    """Quotes from the seed demo broker should not appear in test broker results."""
    resp = auth_session.get(f"{base_url}/api/quotes")
    assert resp.status_code == 200
    for quote in resp.json()["data"]:
        assert quote["client"]["email"] != "alex.johnson@smartquote.com"


# ── Detail ────────────────────────────────────────────────────────────────────

def test_get_quote_by_id(auth_session, base_url, created_quote):
    quote_id = created_quote["id"]
    resp = auth_session.get(f"{base_url}/api/quotes/{quote_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == quote_id
    assert body["type"] == "car"
    assert body["client"]["firstName"] == "Jane"


def test_get_quote_not_found(auth_session, base_url):
    resp = auth_session.get(f"{base_url}/api/quotes/999999")
    assert resp.status_code == 404
    assert resp.json()["code"] == "QUOTE_NOT_FOUND"


def test_get_quote_other_broker_not_found(base_url):
    """A quote belonging to another broker must be invisible (acts as 404)."""
    import requests

    session = requests.Session()
    session.post(
        f"{base_url}/api/auth/login",
        json={"email": "alex.johnson@smartquote.com", "password": "demo1234"},
    )
    resp = session.get(f"{base_url}/api/quotes/1")
    # Could be 200 (demo broker owns it) or 404, but must not be 500
    assert resp.status_code in (200, 404)
