# Run with: pytest api_tests/
# Requires only the backend: npm run dev:server (+ Docker postgres via npm run db:start)
# Set API_BASE_URL env var to override the default http://localhost:3001

import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3001")
TEST_EMAIL = "pytest_api_tester@smartquote.test"
TEST_PASSWORD = "pytest_pass_123"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def auth_session(base_url):
    """Authenticated session for the isolated test broker account."""
    session = requests.Session()

    reg = session.post(
        f"{base_url}/api/auth/register",
        json={
            "name": "Pytest Tester",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "licenseNumber": "PYTEST-001",
            "agency": "Pytest Agency",
        },
    )

    if reg.status_code == 409:
        # Account already exists from a previous run — just log in
        login = session.post(
            f"{base_url}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        assert login.status_code == 200, f"Login failed: {login.text}"
    else:
        assert reg.status_code == 201, f"Registration failed: {reg.text}"

    yield session

    session.post(f"{base_url}/api/auth/logout")


def _sample_client():
    return {
        "firstName": "Jane",
        "lastName": "Testclient",
        "dateOfBirth": "1990-03-20",
        "email": "jane.testclient@example.com",
        "phone": "555-0199",
        "address": "99 Test Ave",
        "city": "Testburg",
        "state": "TX",
        "zipCode": "73301",
    }


def _car_condition(prior_accidents=0):
    return {
        "coverageLevel": "standard",
        "usage": "personal",
        "vehicleYear": 2021,
        "annualMileage": 12000,
        "priorAccidents": prior_accidents,
        "driverLicenseYears": 8,
    }


def _house_condition():
    return {
        "constructionType": "brick",
        "roofType": "asphalt",
        "roofAge": 5,
        "occupancy": "owner",
        "hasSprinklers": False,
        "hasSecuritySystem": True,
        "hasPool": False,
        "yearBuilt": 1995,
        "desiredCoverage": 300000,
    }


def _health_condition(smoking="never", conditions=None):
    return {
        "planType": "PPO",
        "coverageType": "individual",
        "clientAge": 35,
        "smokingStatus": smoking,
        "bmi": 24,
        "preExistingConditions": conditions or [],
        "prescriptionCount": 1,
        "needsDental": True,
        "needsVision": False,
        "needsMental": False,
        "desiredDeductible": 1000,
    }


@pytest.fixture(scope="session")
def created_quote(auth_session, base_url):
    """A session-scoped car quote used by clients/stats tests."""
    resp = auth_session.post(
        f"{base_url}/api/quotes",
        json={
            "type": "car",
            "client": _sample_client(),
            "condition": _car_condition(),
        },
    )
    assert resp.status_code == 201
    return resp.json()
