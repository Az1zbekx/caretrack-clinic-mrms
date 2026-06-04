#!/usr/bin/env bash

# CareTrack Clinic - Automated API Verification Suite

PORT=5001
API_URL="http://localhost:$PORT/api"

# Text Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}    CareTrack Clinic MRMS - API Verification Suite   ${NC}"
echo -e "${CYAN}=====================================================${NC}"

# Check if server is running, if not start it
curl -s "http://localhost:$PORT" > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Server is not running. Starting CareTrack Clinic server in the background...${NC}"
  npm run start > server_test.log 2>&1 &
  SERVER_PID=$!
  # Wait for server to boot
  sleep 3
else
  echo -e "${GREEN}Detected running server on port $PORT.${NC}"
fi

# Function to clean up background server
cleanup() {
  if [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}Shutting down background server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID
    rm -f server_test.log
  fi
}
trap cleanup EXIT

# Test Variables
ADMIN_TOKEN=""
CLINICIAN_TOKEN=""
RECEPTIONIST_TOKEN=""
NEW_DOCTOR_ID=""
NEW_PATIENT_ID=""
NEW_DIAGNOSIS_ID=""

# Helper function to print test results
assert_status() {
  local description="$1"
  local actual="$2"
  local expected="$3"
  if [ "$actual" -eq "$expected" ]; then
    echo -e "  [${GREEN}PASS${NC}] $description (Status: $actual)"
  else
    echo -e "  [${RED}FAIL${NC}] $description (Expected: $expected, Got: $actual)"
    exit 1
  fi
}

# ==========================================
# 1. AUTHENTICATION TESTS
# ==========================================
echo -e "\n${YELLOW}Step 1: Running Authentication Tests...${NC}"

# Login Admin
echo -e "Logging in as Administrator (admin)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin123"}')
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Login Administrator" "$STATUS_CODE" 200
ADMIN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# Login Clinician
echo -e "Logging in as Clinician (clinician)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"clinician", "password":"clinician123"}')
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Login Clinician" "$STATUS_CODE" 200
CLINICIAN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# Login Receptionist
echo -e "Logging in as Receptionist (receptionist)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"receptionist", "password":"receptionist123"}')
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Login Receptionist" "$STATUS_CODE" 200
RECEPTIONIST_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# Get Profile with Token
echo -e "Retrieving Profile with Admin Token..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status "Fetch Profile with Token" "$STATUS_CODE" 200

# Get Profile without Token (Should fail)
echo -e "Retrieving Profile without Token..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/auth/profile")
assert_status "Fetch Profile without Token (Should return 401)" "$STATUS_CODE" 401


# ==========================================
# 2. DOCTORS ENDPOINTS (RBAC)
# ==========================================
echo -e "\n${YELLOW}Step 2: Running Doctors Registry Tests...${NC}"

# Add Doctor as Admin (Should succeed)
echo -e "Creating Doctor as Administrator..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/doctors" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Dr. Gregory House", "specialty":"Diagnostic Medicine", "department":"Diagnostics Department", "contact_info":"+998909998877"}')
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Create Doctor as Admin" "$STATUS_CODE" 201
NEW_DOCTOR_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

# Add Doctor as Clinician (Should fail with 403)
echo -e "Creating Doctor as Clinician (Should fail)..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/doctors" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Dr. Evil", "specialty":"Destruction", "department":"Underworld", "contact_info":"+1234567"}')
assert_status "Create Doctor as Clinician (Blocked)" "$STATUS_CODE" 403


# ==========================================
# 3. PATIENTS ENDPOINTS (RBAC)
# ==========================================
echo -e "\n${YELLOW}Step 3: Running Patient Registry Tests...${NC}"

# Add Patient as Receptionist (Should succeed)
echo -e "Creating Patient as Receptionist..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/patients" \
  -H "Authorization: Bearer $RECEPTIONIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Bob Vance\", \"age\":45, \"gender\":\"Male\", \"phone\":\"+998946665544\", \"address\":\"Scranton, PA\", \"doctor_id\":\"$NEW_DOCTOR_ID\"}")
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Create Patient as Receptionist" "$STATUS_CODE" 201
NEW_PATIENT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

# Update Patient as Clinician (Should succeed)
echo -e "Updating Patient as Clinician..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API_URL/patients/$NEW_PATIENT_ID" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Bob Vance Jr.\", \"age\":46, \"gender\":\"Male\", \"phone\":\"+998946665544\", \"address\":\"Scranton, PA\", \"doctor_id\":\"$NEW_DOCTOR_ID\"}")
assert_status "Update Patient as Clinician" "$STATUS_CODE" 200

# Delete Patient as Clinician (Should fail with 403)
echo -e "Deleting Patient as Clinician (Should fail)..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/patients/$NEW_PATIENT_ID" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN")
assert_status "Delete Patient as Clinician (Blocked)" "$STATUS_CODE" 403


# ==========================================
# 4. DIAGNOSES ENDPOINTS (RBAC)
# ==========================================
echo -e "\n${YELLOW}Step 4: Running Diagnosis Timeline Tests...${NC}"

# Add Diagnosis as Clinician (Should succeed)
echo -e "Creating Diagnosis as Clinician..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/diagnoses" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"icd_code\":\"E11.9\", \"description\":\"Type 2 diabetes mellitus without complications\", \"severity\":\"Medium\", \"patient_id\":\"$NEW_PATIENT_ID\"}")
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
assert_status "Create Diagnosis as Clinician" "$STATUS_CODE" 201
NEW_DIAGNOSIS_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

# Add Diagnosis as Receptionist (Should fail with 403)
echo -e "Creating Diagnosis as Receptionist (Should fail)..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/diagnoses" \
  -H "Authorization: Bearer $RECEPTIONIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"icd_code\":\"I10\", \"description\":\"Essential hypertension\", \"severity\":\"High\", \"patient_id\":\"$NEW_PATIENT_ID\"}")
assert_status "Create Diagnosis as Receptionist (Blocked)" "$STATUS_CODE" 403


# ==========================================
# 5. DASHBOARD STATS
# ==========================================
echo -e "\n${YELLOW}Step 5: Verifying Dashboard Feeds...${NC}"

echo -e "Fetching Dashboard Statistics..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN")
assert_status "Fetch Dashboard Stats" "$STATUS_CODE" 200

echo -e "Fetching Recent Activity Stream..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/dashboard/recent" \
  -H "Authorization: Bearer $CLINICIAN_TOKEN")
assert_status "Fetch Recent Activity Logs" "$STATUS_CODE" 200


# ==========================================
# 6. TEARDOWN AND CLEANUP (DATA INTEGRITY)
# ==========================================
echo -e "\n${YELLOW}Step 6: Running Teardown (Clean Database)...${NC}"

# Delete Diagnosis as Admin
echo -e "Deleting Diagnosis as Administrator..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/diagnoses/$NEW_DIAGNOSIS_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status "Delete Diagnosis as Admin" "$STATUS_CODE" 200

# Delete Patient as Admin
echo -e "Deleting Patient as Administrator..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/patients/$NEW_PATIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status "Delete Patient as Admin" "$STATUS_CODE" 200

# Delete Doctor as Admin
echo -e "Deleting Doctor as Administrator..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/doctors/$NEW_DOCTOR_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status "Delete Doctor as Admin" "$STATUS_CODE" 200

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}   API VERIFICATION SUCCESSFUL - ALL TESTS PASSED    ${NC}"
echo -e "${GREEN}=====================================================${NC}"

exit 0
