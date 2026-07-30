import http from "k6/http";
import { check } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:5080";
const tenantId =
  __ENV.TENANT_ID || "ffffffff-ffff-ffff-ffff-ffffffffcace";
const scenarioName = __ENV.SCENARIO_NAME || "request-dashboard";
const summaryPath = __ENV.SUMMARY_PATH || "/results/summary.json";

export const options = {
  vus: Number.parseInt(__ENV.VUS || "10", 10),
  duration: __ENV.DURATION || "30s",
  discardResponseBodies: true,
  summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "min", "max"],
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250"],
  },
  tags: {
    workload: "request-dashboard",
    scenario: scenarioName,
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/v1/requests/dashboard`, {
    headers: {
      "X-Tenant-Id": tenantId,
    },
    tags: {
      endpoint: "GET /api/v1/requests/dashboard",
    },
  });

  check(response, {
    "dashboard returns 200": (result) => result.status === 200,
  });
}

export function handleSummary(data) {
  return {
    [summaryPath]: JSON.stringify(data, null, 2),
  };
}
