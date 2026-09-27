"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {
  $defs: {
    Booking: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        request_id: { title: "Request Id", type: "string" },
        car_id: { title: "Car Id", type: "string" },
        day: { title: "Day", type: "string" },
      },
      required: ["id", "request_id", "car_id", "day"],
      title: "Booking",
      type: "object",
    },
    Car: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        name: { title: "Name", type: "string" },
        features: {
          items: { type: "string" },
          title: "Features",
          type: "array",
        },
        available: { default: true, title: "Available", type: "boolean" },
      },
      required: ["id", "name", "features", "available"],
      title: "Car",
      type: "object",
    },
    EvaluationCheck: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        category: { title: "Category", type: "string" },
        title: { title: "Title", type: "string" },
        verdict: {
          enum: ["pass", "fail", "not_applicable", "not_assessed"],
          title: "Verdict",
          type: "string",
        },
        detail: { title: "Detail", type: "string" },
        evidence_sequences: {
          items: { type: "integer" },
          title: "Evidence Sequences",
          type: "array",
        },
      },
      required: [
        "id",
        "category",
        "title",
        "verdict",
        "detail",
        "evidence_sequences",
      ],
      title: "EvaluationCheck",
      type: "object",
    },
    ExperimentConfig: {
      additionalProperties: false,
      properties: {
        budget_usd: {
          default: 0.5,
          exclusiveMinimum: 0,
          maximum: 1,
          title: "Budget Usd",
          type: "number",
        },
        max_turns: {
          default: 8,
          maximum: 8,
          minimum: 1,
          title: "Max Turns",
          type: "integer",
        },
        max_tool_calls: {
          default: 12,
          maximum: 12,
          minimum: 1,
          title: "Max Tool Calls",
          type: "integer",
        },
        max_output_tokens: {
          default: 512,
          maximum: 512,
          minimum: 1,
          title: "Max Output Tokens",
          type: "integer",
        },
        max_input_tokens: {
          default: 6000,
          maximum: 6000,
          minimum: 1,
          title: "Max Input Tokens",
          type: "integer",
        },
        repetitions: {
          default: 1,
          maximum: 10,
          minimum: 1,
          title: "Repetitions",
          type: "integer",
        },
      },
      required: [
        "budget_usd",
        "max_turns",
        "max_tool_calls",
        "max_output_tokens",
        "max_input_tokens",
        "repetitions",
      ],
      title: "ExperimentConfig",
      type: "object",
    },
    Grade: {
      additionalProperties: false,
      properties: {
        success: { title: "Success", type: "boolean" },
        completed_requests: { title: "Completed Requests", type: "integer" },
        total_requests: { title: "Total Requests", type: "integer" },
        violations: {
          items: { type: "string" },
          title: "Violations",
          type: "array",
        },
      },
      required: [
        "success",
        "completed_requests",
        "total_requests",
        "violations",
      ],
      title: "Grade",
      type: "object",
    },
    RentalRequest: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        customer: { title: "Customer", type: "string" },
        trip: { title: "Trip", type: "string" },
        required_feature: { title: "Required Feature", type: "string" },
        allowed_days: {
          items: { type: "string" },
          title: "Allowed Days",
          type: "array",
        },
      },
      required: ["id", "customer", "trip", "required_feature", "allowed_days"],
      title: "RentalRequest",
      type: "object",
    },
    RentalState: {
      additionalProperties: false,
      properties: {
        cars: { items: { $ref: "#/$defs/Car" }, title: "Cars", type: "array" },
        bookings: {
          items: { $ref: "#/$defs/Booking" },
          title: "Bookings",
          type: "array",
        },
      },
      required: ["cars", "bookings"],
      title: "RentalState",
      type: "object",
    },
    Scenario: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        base_id: { title: "Base Id", type: "string" },
        version: {
          default: "2.0",
          enum: ["2.0", "3.0"],
          title: "Version",
          type: "string",
        },
        title: { title: "Title", type: "string" },
        description: { title: "Description", type: "string" },
        family: {
          enum: [
            "transient_read",
            "car_unavailable",
            "committed_timeout",
            "prompt_injection",
            "no_matching_car",
            "competing_requests",
          ],
          title: "Family",
          type: "string",
        },
        variant: { enum: ["clean", "fault"], title: "Variant", type: "string" },
        requests: {
          items: { $ref: "#/$defs/RentalRequest" },
          title: "Requests",
          type: "array",
        },
        initial_state: { $ref: "#/$defs/RentalState" },
        expected_outcome: {
          default: "booked",
          enum: ["booked", "unavailable"],
          title: "Expected Outcome",
          type: "string",
        },
        rental_notice: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Rental Notice",
        },
      },
      required: [
        "id",
        "base_id",
        "version",
        "title",
        "description",
        "family",
        "variant",
        "requests",
        "initial_state",
        "expected_outcome",
        "rental_notice",
      ],
      title: "Scenario",
      type: "object",
    },
    StepAssessment: {
      additionalProperties: false,
      properties: {
        sequence: { title: "Sequence", type: "integer" },
        verdict: {
          enum: ["accepted", "rejected", "disrupted"],
          title: "Verdict",
          type: "string",
        },
        detail: { title: "Detail", type: "string" },
      },
      required: ["sequence", "verdict", "detail"],
      title: "StepAssessment",
      type: "object",
    },
    ToolResult: {
      additionalProperties: false,
      properties: {
        data: { additionalProperties: true, title: "Data", type: "object" },
        error: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Error",
        },
        fault: {
          anyOf: [
            {
              enum: [
                "transient_read",
                "car_unavailable",
                "committed_timeout",
                "prompt_injection",
                "no_matching_car",
                "competing_requests",
              ],
              type: "string",
            },
            { type: "null" },
          ],
          default: null,
          title: "Fault",
        },
      },
      required: ["data", "error", "fault"],
      title: "ToolResult",
      type: "object",
    },
    TraceEvent: {
      additionalProperties: false,
      properties: {
        sequence: { title: "Sequence", type: "integer" },
        kind: {
          enum: ["tool", "message", "stopped"],
          title: "Kind",
          type: "string",
        },
        turn: { title: "Turn", type: "integer" },
        tool: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Tool",
        },
        arguments: {
          anyOf: [
            { additionalProperties: true, type: "object" },
            { type: "null" },
          ],
          default: null,
          title: "Arguments",
        },
        result: {
          anyOf: [{ $ref: "#/$defs/ToolResult" }, { type: "null" }],
          default: null,
        },
        text: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Text",
        },
        state: { $ref: "#/$defs/RentalState" },
      },
      required: [
        "sequence",
        "kind",
        "turn",
        "tool",
        "arguments",
        "result",
        "text",
        "state",
      ],
      title: "TraceEvent",
      type: "object",
    },
    TrialAssessment: {
      additionalProperties: false,
      properties: {
        grader_version: {
          const: "1.0",
          default: "1.0",
          title: "Grader Version",
          type: "string",
        },
        checks: {
          items: { $ref: "#/$defs/EvaluationCheck" },
          title: "Checks",
          type: "array",
        },
        steps: {
          items: { $ref: "#/$defs/StepAssessment" },
          title: "Steps",
          type: "array",
        },
        turns: { title: "Turns", type: "integer" },
        repeated_reads: { title: "Repeated Reads", type: "integer" },
        safe_retries: { title: "Safe Retries", type: "integer" },
      },
      required: [
        "grader_version",
        "checks",
        "steps",
        "turns",
        "repeated_reads",
        "safe_retries",
      ],
      title: "TrialAssessment",
      type: "object",
    },
    TrialResult: {
      additionalProperties: false,
      properties: {
        id: { title: "Id", type: "string" },
        scenario_id: { title: "Scenario Id", type: "string" },
        agent: { title: "Agent", type: "string" },
        provider: { title: "Provider", type: "string" },
        model: { title: "Model", type: "string" },
        returned_model: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Returned Model",
        },
        source: { enum: ["scripted", "live"], title: "Source", type: "string" },
        repetition: { default: 1, title: "Repetition", type: "integer" },
        status: {
          enum: [
            "completed",
            "turn_limit",
            "tool_limit",
            "provider_error",
            "budget_exhausted",
            "input_limit",
            "output_truncated",
            "interrupted",
            "not_run",
          ],
          title: "Status",
          type: "string",
        },
        started_at: { title: "Started At", type: "string" },
        latency_ms: { minimum: 0, title: "Latency Ms", type: "number" },
        tool_calls: { minimum: 0, title: "Tool Calls", type: "integer" },
        invalid_actions: {
          minimum: 0,
          title: "Invalid Actions",
          type: "integer",
        },
        usage: { $ref: "#/$defs/Usage" },
        estimated_cost_usd: {
          minimum: 0,
          title: "Estimated Cost Usd",
          type: "number",
        },
        reserved_cost_usd: {
          default: 0,
          minimum: 0,
          title: "Reserved Cost Usd",
          type: "number",
        },
        usage_complete: {
          default: true,
          title: "Usage Complete",
          type: "boolean",
        },
        settings: {
          additionalProperties: true,
          title: "Settings",
          type: "object",
        },
        grade: { $ref: "#/$defs/Grade" },
        final_state: { $ref: "#/$defs/RentalState" },
        events: {
          items: { $ref: "#/$defs/TraceEvent" },
          title: "Events",
          type: "array",
        },
        assessment: {
          anyOf: [{ $ref: "#/$defs/TrialAssessment" }, { type: "null" }],
          default: null,
        },
      },
      required: [
        "id",
        "scenario_id",
        "agent",
        "provider",
        "model",
        "returned_model",
        "source",
        "repetition",
        "status",
        "started_at",
        "latency_ms",
        "tool_calls",
        "invalid_actions",
        "usage",
        "estimated_cost_usd",
        "reserved_cost_usd",
        "usage_complete",
        "settings",
        "grade",
        "final_state",
        "events",
        "assessment",
      ],
      title: "TrialResult",
      type: "object",
    },
    Usage: {
      additionalProperties: false,
      properties: {
        input_tokens: {
          default: 0,
          minimum: 0,
          title: "Input Tokens",
          type: "integer",
        },
        output_tokens: {
          default: 0,
          minimum: 0,
          title: "Output Tokens",
          type: "integer",
        },
      },
      required: ["input_tokens", "output_tokens"],
      title: "Usage",
      type: "object",
    },
  },
  additionalProperties: false,
  properties: {
    schema_version: {
      default: "3.0",
      enum: ["2.0", "3.0"],
      title: "Schema Version",
      type: "string",
    },
    experiment_id: { title: "Experiment Id", type: "string" },
    created_at: { title: "Created At", type: "string" },
    code_revision: { title: "Code Revision", type: "string" },
    prompt_version: {
      default: "3.0",
      enum: ["2.0", "3.0"],
      title: "Prompt Version",
      type: "string",
    },
    config: { $ref: "#/$defs/ExperimentConfig" },
    scenarios: {
      items: { $ref: "#/$defs/Scenario" },
      title: "Scenarios",
      type: "array",
    },
    trials: {
      items: { $ref: "#/$defs/TrialResult" },
      title: "Trials",
      type: "array",
    },
  },
  required: [
    "schema_version",
    "experiment_id",
    "created_at",
    "code_revision",
    "prompt_version",
    "config",
    "scenarios",
    "trials",
  ],
  title: "EvaluationBundle",
  type: "object",
  $schema: "https://json-schema.org/draft/2020-12/schema",
};
const schema32 = {
  additionalProperties: false,
  properties: {
    budget_usd: {
      default: 0.5,
      exclusiveMinimum: 0,
      maximum: 1,
      title: "Budget Usd",
      type: "number",
    },
    max_turns: {
      default: 8,
      maximum: 8,
      minimum: 1,
      title: "Max Turns",
      type: "integer",
    },
    max_tool_calls: {
      default: 12,
      maximum: 12,
      minimum: 1,
      title: "Max Tool Calls",
      type: "integer",
    },
    max_output_tokens: {
      default: 512,
      maximum: 512,
      minimum: 1,
      title: "Max Output Tokens",
      type: "integer",
    },
    max_input_tokens: {
      default: 6000,
      maximum: 6000,
      minimum: 1,
      title: "Max Input Tokens",
      type: "integer",
    },
    repetitions: {
      default: 1,
      maximum: 10,
      minimum: 1,
      title: "Repetitions",
      type: "integer",
    },
  },
  required: [
    "budget_usd",
    "max_turns",
    "max_tool_calls",
    "max_output_tokens",
    "max_input_tokens",
    "repetitions",
  ],
  title: "ExperimentConfig",
  type: "object",
};
const schema33 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    base_id: { title: "Base Id", type: "string" },
    version: {
      default: "2.0",
      enum: ["2.0", "3.0"],
      title: "Version",
      type: "string",
    },
    title: { title: "Title", type: "string" },
    description: { title: "Description", type: "string" },
    family: {
      enum: [
        "transient_read",
        "car_unavailable",
        "committed_timeout",
        "prompt_injection",
        "no_matching_car",
        "competing_requests",
      ],
      title: "Family",
      type: "string",
    },
    variant: { enum: ["clean", "fault"], title: "Variant", type: "string" },
    requests: {
      items: { $ref: "#/$defs/RentalRequest" },
      title: "Requests",
      type: "array",
    },
    initial_state: { $ref: "#/$defs/RentalState" },
    expected_outcome: {
      default: "booked",
      enum: ["booked", "unavailable"],
      title: "Expected Outcome",
      type: "string",
    },
    rental_notice: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Rental Notice",
    },
  },
  required: [
    "id",
    "base_id",
    "version",
    "title",
    "description",
    "family",
    "variant",
    "requests",
    "initial_state",
    "expected_outcome",
    "rental_notice",
  ],
  title: "Scenario",
  type: "object",
};
const schema34 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    customer: { title: "Customer", type: "string" },
    trip: { title: "Trip", type: "string" },
    required_feature: { title: "Required Feature", type: "string" },
    allowed_days: {
      items: { type: "string" },
      title: "Allowed Days",
      type: "array",
    },
  },
  required: ["id", "customer", "trip", "required_feature", "allowed_days"],
  title: "RentalRequest",
  type: "object",
};
const func1 = Object.prototype.hasOwnProperty;
const schema35 = {
  additionalProperties: false,
  properties: {
    cars: { items: { $ref: "#/$defs/Car" }, title: "Cars", type: "array" },
    bookings: {
      items: { $ref: "#/$defs/Booking" },
      title: "Bookings",
      type: "array",
    },
  },
  required: ["cars", "bookings"],
  title: "RentalState",
  type: "object",
};
const schema36 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    name: { title: "Name", type: "string" },
    features: { items: { type: "string" }, title: "Features", type: "array" },
    available: { default: true, title: "Available", type: "boolean" },
  },
  required: ["id", "name", "features", "available"],
  title: "Car",
  type: "object",
};
const schema37 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    request_id: { title: "Request Id", type: "string" },
    car_id: { title: "Car Id", type: "string" },
    day: { title: "Day", type: "string" },
  },
  required: ["id", "request_id", "car_id", "day"],
  title: "Booking",
  type: "object",
};
function validate22(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.cars === undefined && (missing0 = "cars")) ||
        (data.bookings === undefined && (missing0 = "bookings"))
      ) {
        validate22.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "cars" || key0 === "bookings")) {
            validate22.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.cars !== undefined) {
            let data0 = data.cars;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data0)) {
                var valid1 = true;
                const len0 = data0.length;
                for (let i0 = 0; i0 < len0; i0++) {
                  let data1 = data0[i0];
                  const _errs4 = errors;
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (
                      data1 &&
                      typeof data1 == "object" &&
                      !Array.isArray(data1)
                    ) {
                      let missing1;
                      if (
                        (data1.id === undefined && (missing1 = "id")) ||
                        (data1.name === undefined && (missing1 = "name")) ||
                        (data1.features === undefined &&
                          (missing1 = "features")) ||
                        (data1.available === undefined &&
                          (missing1 = "available"))
                      ) {
                        validate22.errors = [
                          {
                            instancePath: instancePath + "/cars/" + i0,
                            schemaPath: "#/$defs/Car/required",
                            keyword: "required",
                            params: { missingProperty: missing1 },
                            message:
                              "must have required property '" + missing1 + "'",
                          },
                        ];
                        return false;
                      } else {
                        const _errs7 = errors;
                        for (const key1 in data1) {
                          if (!(
                            key1 === "id" ||
                            key1 === "name" ||
                            key1 === "features" ||
                            key1 === "available"
                          )) {
                            validate22.errors = [
                              {
                                instancePath: instancePath + "/cars/" + i0,
                                schemaPath: "#/$defs/Car/additionalProperties",
                                keyword: "additionalProperties",
                                params: { additionalProperty: key1 },
                                message: "must NOT have additional properties",
                              },
                            ];
                            return false;
                            break;
                          }
                        }
                        if (_errs7 === errors) {
                          if (data1.id !== undefined) {
                            const _errs8 = errors;
                            if (typeof data1.id !== "string") {
                              validate22.errors = [
                                {
                                  instancePath:
                                    instancePath + "/cars/" + i0 + "/id",
                                  schemaPath: "#/$defs/Car/properties/id/type",
                                  keyword: "type",
                                  params: { type: "string" },
                                  message: "must be string",
                                },
                              ];
                              return false;
                            }
                            var valid3 = _errs8 === errors;
                          } else {
                            var valid3 = true;
                          }
                          if (valid3) {
                            if (data1.name !== undefined) {
                              const _errs10 = errors;
                              if (typeof data1.name !== "string") {
                                validate22.errors = [
                                  {
                                    instancePath:
                                      instancePath + "/cars/" + i0 + "/name",
                                    schemaPath:
                                      "#/$defs/Car/properties/name/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  },
                                ];
                                return false;
                              }
                              var valid3 = _errs10 === errors;
                            } else {
                              var valid3 = true;
                            }
                            if (valid3) {
                              if (data1.features !== undefined) {
                                let data4 = data1.features;
                                const _errs12 = errors;
                                if (errors === _errs12) {
                                  if (Array.isArray(data4)) {
                                    var valid4 = true;
                                    const len1 = data4.length;
                                    for (let i1 = 0; i1 < len1; i1++) {
                                      const _errs14 = errors;
                                      if (typeof data4[i1] !== "string") {
                                        validate22.errors = [
                                          {
                                            instancePath:
                                              instancePath +
                                              "/cars/" +
                                              i0 +
                                              "/features/" +
                                              i1,
                                            schemaPath:
                                              "#/$defs/Car/properties/features/items/type",
                                            keyword: "type",
                                            params: { type: "string" },
                                            message: "must be string",
                                          },
                                        ];
                                        return false;
                                      }
                                      var valid4 = _errs14 === errors;
                                      if (!valid4) {
                                        break;
                                      }
                                    }
                                  } else {
                                    validate22.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/cars/" +
                                          i0 +
                                          "/features",
                                        schemaPath:
                                          "#/$defs/Car/properties/features/type",
                                        keyword: "type",
                                        params: { type: "array" },
                                        message: "must be array",
                                      },
                                    ];
                                    return false;
                                  }
                                }
                                var valid3 = _errs12 === errors;
                              } else {
                                var valid3 = true;
                              }
                              if (valid3) {
                                if (data1.available !== undefined) {
                                  const _errs16 = errors;
                                  if (typeof data1.available !== "boolean") {
                                    validate22.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/cars/" +
                                          i0 +
                                          "/available",
                                        schemaPath:
                                          "#/$defs/Car/properties/available/type",
                                        keyword: "type",
                                        params: { type: "boolean" },
                                        message: "must be boolean",
                                      },
                                    ];
                                    return false;
                                  }
                                  var valid3 = _errs16 === errors;
                                } else {
                                  var valid3 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate22.errors = [
                        {
                          instancePath: instancePath + "/cars/" + i0,
                          schemaPath: "#/$defs/Car/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object",
                        },
                      ];
                      return false;
                    }
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              } else {
                validate22.errors = [
                  {
                    instancePath: instancePath + "/cars",
                    schemaPath: "#/properties/cars/type",
                    keyword: "type",
                    params: { type: "array" },
                    message: "must be array",
                  },
                ];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.bookings !== undefined) {
              let data7 = data.bookings;
              const _errs18 = errors;
              if (errors === _errs18) {
                if (Array.isArray(data7)) {
                  var valid5 = true;
                  const len2 = data7.length;
                  for (let i2 = 0; i2 < len2; i2++) {
                    let data8 = data7[i2];
                    const _errs20 = errors;
                    const _errs21 = errors;
                    if (errors === _errs21) {
                      if (
                        data8 &&
                        typeof data8 == "object" &&
                        !Array.isArray(data8)
                      ) {
                        let missing2;
                        if (
                          (data8.id === undefined && (missing2 = "id")) ||
                          (data8.request_id === undefined &&
                            (missing2 = "request_id")) ||
                          (data8.car_id === undefined &&
                            (missing2 = "car_id")) ||
                          (data8.day === undefined && (missing2 = "day"))
                        ) {
                          validate22.errors = [
                            {
                              instancePath: instancePath + "/bookings/" + i2,
                              schemaPath: "#/$defs/Booking/required",
                              keyword: "required",
                              params: { missingProperty: missing2 },
                              message:
                                "must have required property '" +
                                missing2 +
                                "'",
                            },
                          ];
                          return false;
                        } else {
                          const _errs23 = errors;
                          for (const key2 in data8) {
                            if (!(
                              key2 === "id" ||
                              key2 === "request_id" ||
                              key2 === "car_id" ||
                              key2 === "day"
                            )) {
                              validate22.errors = [
                                {
                                  instancePath:
                                    instancePath + "/bookings/" + i2,
                                  schemaPath:
                                    "#/$defs/Booking/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: { additionalProperty: key2 },
                                  message:
                                    "must NOT have additional properties",
                                },
                              ];
                              return false;
                              break;
                            }
                          }
                          if (_errs23 === errors) {
                            if (data8.id !== undefined) {
                              const _errs24 = errors;
                              if (typeof data8.id !== "string") {
                                validate22.errors = [
                                  {
                                    instancePath:
                                      instancePath + "/bookings/" + i2 + "/id",
                                    schemaPath:
                                      "#/$defs/Booking/properties/id/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  },
                                ];
                                return false;
                              }
                              var valid7 = _errs24 === errors;
                            } else {
                              var valid7 = true;
                            }
                            if (valid7) {
                              if (data8.request_id !== undefined) {
                                const _errs26 = errors;
                                if (typeof data8.request_id !== "string") {
                                  validate22.errors = [
                                    {
                                      instancePath:
                                        instancePath +
                                        "/bookings/" +
                                        i2 +
                                        "/request_id",
                                      schemaPath:
                                        "#/$defs/Booking/properties/request_id/type",
                                      keyword: "type",
                                      params: { type: "string" },
                                      message: "must be string",
                                    },
                                  ];
                                  return false;
                                }
                                var valid7 = _errs26 === errors;
                              } else {
                                var valid7 = true;
                              }
                              if (valid7) {
                                if (data8.car_id !== undefined) {
                                  const _errs28 = errors;
                                  if (typeof data8.car_id !== "string") {
                                    validate22.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/bookings/" +
                                          i2 +
                                          "/car_id",
                                        schemaPath:
                                          "#/$defs/Booking/properties/car_id/type",
                                        keyword: "type",
                                        params: { type: "string" },
                                        message: "must be string",
                                      },
                                    ];
                                    return false;
                                  }
                                  var valid7 = _errs28 === errors;
                                } else {
                                  var valid7 = true;
                                }
                                if (valid7) {
                                  if (data8.day !== undefined) {
                                    const _errs30 = errors;
                                    if (typeof data8.day !== "string") {
                                      validate22.errors = [
                                        {
                                          instancePath:
                                            instancePath +
                                            "/bookings/" +
                                            i2 +
                                            "/day",
                                          schemaPath:
                                            "#/$defs/Booking/properties/day/type",
                                          keyword: "type",
                                          params: { type: "string" },
                                          message: "must be string",
                                        },
                                      ];
                                      return false;
                                    }
                                    var valid7 = _errs30 === errors;
                                  } else {
                                    var valid7 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        validate22.errors = [
                          {
                            instancePath: instancePath + "/bookings/" + i2,
                            schemaPath: "#/$defs/Booking/type",
                            keyword: "type",
                            params: { type: "object" },
                            message: "must be object",
                          },
                        ];
                        return false;
                      }
                    }
                    var valid5 = _errs20 === errors;
                    if (!valid5) {
                      break;
                    }
                  }
                } else {
                  validate22.errors = [
                    {
                      instancePath: instancePath + "/bookings",
                      schemaPath: "#/properties/bookings/type",
                      keyword: "type",
                      params: { type: "array" },
                      message: "must be array",
                    },
                  ];
                  return false;
                }
              }
              var valid0 = _errs18 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate22.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
function validate21(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.id === undefined && (missing0 = "id")) ||
        (data.base_id === undefined && (missing0 = "base_id")) ||
        (data.version === undefined && (missing0 = "version")) ||
        (data.title === undefined && (missing0 = "title")) ||
        (data.description === undefined && (missing0 = "description")) ||
        (data.family === undefined && (missing0 = "family")) ||
        (data.variant === undefined && (missing0 = "variant")) ||
        (data.requests === undefined && (missing0 = "requests")) ||
        (data.initial_state === undefined && (missing0 = "initial_state")) ||
        (data.expected_outcome === undefined &&
          (missing0 = "expected_outcome")) ||
        (data.rental_notice === undefined && (missing0 = "rental_notice"))
      ) {
        validate21.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func1.call(schema33.properties, key0)) {
            validate21.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== undefined) {
            const _errs2 = errors;
            if (typeof data.id !== "string") {
              validate21.errors = [
                {
                  instancePath: instancePath + "/id",
                  schemaPath: "#/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                },
              ];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.base_id !== undefined) {
              const _errs4 = errors;
              if (typeof data.base_id !== "string") {
                validate21.errors = [
                  {
                    instancePath: instancePath + "/base_id",
                    schemaPath: "#/properties/base_id/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string",
                  },
                ];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.version !== undefined) {
                let data2 = data.version;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate21.errors = [
                    {
                      instancePath: instancePath + "/version",
                      schemaPath: "#/properties/version/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string",
                    },
                  ];
                  return false;
                }
                if (!(data2 === "2.0" || data2 === "3.0")) {
                  validate21.errors = [
                    {
                      instancePath: instancePath + "/version",
                      schemaPath: "#/properties/version/enum",
                      keyword: "enum",
                      params: {
                        allowedValues: schema33.properties.version.enum,
                      },
                      message: "must be equal to one of the allowed values",
                    },
                  ];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.title !== undefined) {
                  const _errs8 = errors;
                  if (typeof data.title !== "string") {
                    validate21.errors = [
                      {
                        instancePath: instancePath + "/title",
                        schemaPath: "#/properties/title/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string",
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.description !== undefined) {
                    const _errs10 = errors;
                    if (typeof data.description !== "string") {
                      validate21.errors = [
                        {
                          instancePath: instancePath + "/description",
                          schemaPath: "#/properties/description/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        },
                      ];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.family !== undefined) {
                      let data5 = data.family;
                      const _errs12 = errors;
                      if (typeof data5 !== "string") {
                        validate21.errors = [
                          {
                            instancePath: instancePath + "/family",
                            schemaPath: "#/properties/family/type",
                            keyword: "type",
                            params: { type: "string" },
                            message: "must be string",
                          },
                        ];
                        return false;
                      }
                      if (!(
                        data5 === "transient_read" ||
                        data5 === "car_unavailable" ||
                        data5 === "committed_timeout" ||
                        data5 === "prompt_injection" ||
                        data5 === "no_matching_car" ||
                        data5 === "competing_requests"
                      )) {
                        validate21.errors = [
                          {
                            instancePath: instancePath + "/family",
                            schemaPath: "#/properties/family/enum",
                            keyword: "enum",
                            params: {
                              allowedValues: schema33.properties.family.enum,
                            },
                            message:
                              "must be equal to one of the allowed values",
                          },
                        ];
                        return false;
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.variant !== undefined) {
                        let data6 = data.variant;
                        const _errs14 = errors;
                        if (typeof data6 !== "string") {
                          validate21.errors = [
                            {
                              instancePath: instancePath + "/variant",
                              schemaPath: "#/properties/variant/type",
                              keyword: "type",
                              params: { type: "string" },
                              message: "must be string",
                            },
                          ];
                          return false;
                        }
                        if (!(data6 === "clean" || data6 === "fault")) {
                          validate21.errors = [
                            {
                              instancePath: instancePath + "/variant",
                              schemaPath: "#/properties/variant/enum",
                              keyword: "enum",
                              params: {
                                allowedValues: schema33.properties.variant.enum,
                              },
                              message:
                                "must be equal to one of the allowed values",
                            },
                          ];
                          return false;
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.requests !== undefined) {
                          let data7 = data.requests;
                          const _errs16 = errors;
                          if (errors === _errs16) {
                            if (Array.isArray(data7)) {
                              var valid1 = true;
                              const len0 = data7.length;
                              for (let i0 = 0; i0 < len0; i0++) {
                                let data8 = data7[i0];
                                const _errs18 = errors;
                                const _errs19 = errors;
                                if (errors === _errs19) {
                                  if (
                                    data8 &&
                                    typeof data8 == "object" &&
                                    !Array.isArray(data8)
                                  ) {
                                    let missing1;
                                    if (
                                      (data8.id === undefined &&
                                        (missing1 = "id")) ||
                                      (data8.customer === undefined &&
                                        (missing1 = "customer")) ||
                                      (data8.trip === undefined &&
                                        (missing1 = "trip")) ||
                                      (data8.required_feature === undefined &&
                                        (missing1 = "required_feature")) ||
                                      (data8.allowed_days === undefined &&
                                        (missing1 = "allowed_days"))
                                    ) {
                                      validate21.errors = [
                                        {
                                          instancePath:
                                            instancePath + "/requests/" + i0,
                                          schemaPath:
                                            "#/$defs/RentalRequest/required",
                                          keyword: "required",
                                          params: { missingProperty: missing1 },
                                          message:
                                            "must have required property '" +
                                            missing1 +
                                            "'",
                                        },
                                      ];
                                      return false;
                                    } else {
                                      const _errs21 = errors;
                                      for (const key1 in data8) {
                                        if (!(
                                          key1 === "id" ||
                                          key1 === "customer" ||
                                          key1 === "trip" ||
                                          key1 === "required_feature" ||
                                          key1 === "allowed_days"
                                        )) {
                                          validate21.errors = [
                                            {
                                              instancePath:
                                                instancePath +
                                                "/requests/" +
                                                i0,
                                              schemaPath:
                                                "#/$defs/RentalRequest/additionalProperties",
                                              keyword: "additionalProperties",
                                              params: {
                                                additionalProperty: key1,
                                              },
                                              message:
                                                "must NOT have additional properties",
                                            },
                                          ];
                                          return false;
                                          break;
                                        }
                                      }
                                      if (_errs21 === errors) {
                                        if (data8.id !== undefined) {
                                          const _errs22 = errors;
                                          if (typeof data8.id !== "string") {
                                            validate21.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/requests/" +
                                                  i0 +
                                                  "/id",
                                                schemaPath:
                                                  "#/$defs/RentalRequest/properties/id/type",
                                                keyword: "type",
                                                params: { type: "string" },
                                                message: "must be string",
                                              },
                                            ];
                                            return false;
                                          }
                                          var valid3 = _errs22 === errors;
                                        } else {
                                          var valid3 = true;
                                        }
                                        if (valid3) {
                                          if (data8.customer !== undefined) {
                                            const _errs24 = errors;
                                            if (
                                              typeof data8.customer !== "string"
                                            ) {
                                              validate21.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/requests/" +
                                                    i0 +
                                                    "/customer",
                                                  schemaPath:
                                                    "#/$defs/RentalRequest/properties/customer/type",
                                                  keyword: "type",
                                                  params: { type: "string" },
                                                  message: "must be string",
                                                },
                                              ];
                                              return false;
                                            }
                                            var valid3 = _errs24 === errors;
                                          } else {
                                            var valid3 = true;
                                          }
                                          if (valid3) {
                                            if (data8.trip !== undefined) {
                                              const _errs26 = errors;
                                              if (
                                                typeof data8.trip !== "string"
                                              ) {
                                                validate21.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath +
                                                      "/requests/" +
                                                      i0 +
                                                      "/trip",
                                                    schemaPath:
                                                      "#/$defs/RentalRequest/properties/trip/type",
                                                    keyword: "type",
                                                    params: { type: "string" },
                                                    message: "must be string",
                                                  },
                                                ];
                                                return false;
                                              }
                                              var valid3 = _errs26 === errors;
                                            } else {
                                              var valid3 = true;
                                            }
                                            if (valid3) {
                                              if (
                                                data8.required_feature !==
                                                undefined
                                              ) {
                                                const _errs28 = errors;
                                                if (
                                                  typeof data8.required_feature !==
                                                  "string"
                                                ) {
                                                  validate21.errors = [
                                                    {
                                                      instancePath:
                                                        instancePath +
                                                        "/requests/" +
                                                        i0 +
                                                        "/required_feature",
                                                      schemaPath:
                                                        "#/$defs/RentalRequest/properties/required_feature/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "string",
                                                      },
                                                      message: "must be string",
                                                    },
                                                  ];
                                                  return false;
                                                }
                                                var valid3 = _errs28 === errors;
                                              } else {
                                                var valid3 = true;
                                              }
                                              if (valid3) {
                                                if (
                                                  data8.allowed_days !==
                                                  undefined
                                                ) {
                                                  let data13 =
                                                    data8.allowed_days;
                                                  const _errs30 = errors;
                                                  if (errors === _errs30) {
                                                    if (Array.isArray(data13)) {
                                                      var valid4 = true;
                                                      const len1 =
                                                        data13.length;
                                                      for (
                                                        let i1 = 0;
                                                        i1 < len1;
                                                        i1++
                                                      ) {
                                                        const _errs32 = errors;
                                                        if (
                                                          typeof data13[i1] !==
                                                          "string"
                                                        ) {
                                                          validate21.errors = [
                                                            {
                                                              instancePath:
                                                                instancePath +
                                                                "/requests/" +
                                                                i0 +
                                                                "/allowed_days/" +
                                                                i1,
                                                              schemaPath:
                                                                "#/$defs/RentalRequest/properties/allowed_days/items/type",
                                                              keyword: "type",
                                                              params: {
                                                                type: "string",
                                                              },
                                                              message:
                                                                "must be string",
                                                            },
                                                          ];
                                                          return false;
                                                        }
                                                        var valid4 =
                                                          _errs32 === errors;
                                                        if (!valid4) {
                                                          break;
                                                        }
                                                      }
                                                    } else {
                                                      validate21.errors = [
                                                        {
                                                          instancePath:
                                                            instancePath +
                                                            "/requests/" +
                                                            i0 +
                                                            "/allowed_days",
                                                          schemaPath:
                                                            "#/$defs/RentalRequest/properties/allowed_days/type",
                                                          keyword: "type",
                                                          params: {
                                                            type: "array",
                                                          },
                                                          message:
                                                            "must be array",
                                                        },
                                                      ];
                                                      return false;
                                                    }
                                                  }
                                                  var valid3 =
                                                    _errs30 === errors;
                                                } else {
                                                  var valid3 = true;
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    validate21.errors = [
                                      {
                                        instancePath:
                                          instancePath + "/requests/" + i0,
                                        schemaPath:
                                          "#/$defs/RentalRequest/type",
                                        keyword: "type",
                                        params: { type: "object" },
                                        message: "must be object",
                                      },
                                    ];
                                    return false;
                                  }
                                }
                                var valid1 = _errs18 === errors;
                                if (!valid1) {
                                  break;
                                }
                              }
                            } else {
                              validate21.errors = [
                                {
                                  instancePath: instancePath + "/requests",
                                  schemaPath: "#/properties/requests/type",
                                  keyword: "type",
                                  params: { type: "array" },
                                  message: "must be array",
                                },
                              ];
                              return false;
                            }
                          }
                          var valid0 = _errs16 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.initial_state !== undefined) {
                            const _errs34 = errors;
                            if (
                              !validate22(data.initial_state, {
                                instancePath: instancePath + "/initial_state",
                                parentData: data,
                                parentDataProperty: "initial_state",
                                rootData,
                                dynamicAnchors,
                              })
                            ) {
                              vErrors =
                                vErrors === null
                                  ? validate22.errors
                                  : vErrors.concat(validate22.errors);
                              errors = vErrors.length;
                            }
                            var valid0 = _errs34 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.expected_outcome !== undefined) {
                              let data16 = data.expected_outcome;
                              const _errs35 = errors;
                              if (typeof data16 !== "string") {
                                validate21.errors = [
                                  {
                                    instancePath:
                                      instancePath + "/expected_outcome",
                                    schemaPath:
                                      "#/properties/expected_outcome/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  },
                                ];
                                return false;
                              }
                              if (!(
                                data16 === "booked" || data16 === "unavailable"
                              )) {
                                validate21.errors = [
                                  {
                                    instancePath:
                                      instancePath + "/expected_outcome",
                                    schemaPath:
                                      "#/properties/expected_outcome/enum",
                                    keyword: "enum",
                                    params: {
                                      allowedValues:
                                        schema33.properties.expected_outcome
                                          .enum,
                                    },
                                    message:
                                      "must be equal to one of the allowed values",
                                  },
                                ];
                                return false;
                              }
                              var valid0 = _errs35 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.rental_notice !== undefined) {
                                let data17 = data.rental_notice;
                                const _errs37 = errors;
                                const _errs38 = errors;
                                let valid5 = false;
                                const _errs39 = errors;
                                if (typeof data17 !== "string") {
                                  const err0 = {
                                    instancePath:
                                      instancePath + "/rental_notice",
                                    schemaPath:
                                      "#/properties/rental_notice/anyOf/0/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err0];
                                  } else {
                                    vErrors.push(err0);
                                  }
                                  errors++;
                                }
                                var _valid0 = _errs39 === errors;
                                valid5 = valid5 || _valid0;
                                const _errs41 = errors;
                                if (data17 !== null) {
                                  const err1 = {
                                    instancePath:
                                      instancePath + "/rental_notice",
                                    schemaPath:
                                      "#/properties/rental_notice/anyOf/1/type",
                                    keyword: "type",
                                    params: { type: "null" },
                                    message: "must be null",
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err1];
                                  } else {
                                    vErrors.push(err1);
                                  }
                                  errors++;
                                }
                                var _valid0 = _errs41 === errors;
                                valid5 = valid5 || _valid0;
                                if (!valid5) {
                                  const err2 = {
                                    instancePath:
                                      instancePath + "/rental_notice",
                                    schemaPath:
                                      "#/properties/rental_notice/anyOf",
                                    keyword: "anyOf",
                                    params: {},
                                    message: "must match a schema in anyOf",
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err2];
                                  } else {
                                    vErrors.push(err2);
                                  }
                                  errors++;
                                  validate21.errors = vErrors;
                                  return false;
                                } else {
                                  errors = _errs38;
                                  if (vErrors !== null) {
                                    if (_errs38) {
                                      vErrors.length = _errs38;
                                    } else {
                                      vErrors = null;
                                    }
                                  }
                                }
                                var valid0 = _errs37 === errors;
                              } else {
                                var valid0 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate21.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
const schema38 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    scenario_id: { title: "Scenario Id", type: "string" },
    agent: { title: "Agent", type: "string" },
    provider: { title: "Provider", type: "string" },
    model: { title: "Model", type: "string" },
    returned_model: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Returned Model",
    },
    source: { enum: ["scripted", "live"], title: "Source", type: "string" },
    repetition: { default: 1, title: "Repetition", type: "integer" },
    status: {
      enum: [
        "completed",
        "turn_limit",
        "tool_limit",
        "provider_error",
        "budget_exhausted",
        "input_limit",
        "output_truncated",
        "interrupted",
        "not_run",
      ],
      title: "Status",
      type: "string",
    },
    started_at: { title: "Started At", type: "string" },
    latency_ms: { minimum: 0, title: "Latency Ms", type: "number" },
    tool_calls: { minimum: 0, title: "Tool Calls", type: "integer" },
    invalid_actions: { minimum: 0, title: "Invalid Actions", type: "integer" },
    usage: { $ref: "#/$defs/Usage" },
    estimated_cost_usd: {
      minimum: 0,
      title: "Estimated Cost Usd",
      type: "number",
    },
    reserved_cost_usd: {
      default: 0,
      minimum: 0,
      title: "Reserved Cost Usd",
      type: "number",
    },
    usage_complete: { default: true, title: "Usage Complete", type: "boolean" },
    settings: { additionalProperties: true, title: "Settings", type: "object" },
    grade: { $ref: "#/$defs/Grade" },
    final_state: { $ref: "#/$defs/RentalState" },
    events: {
      items: { $ref: "#/$defs/TraceEvent" },
      title: "Events",
      type: "array",
    },
    assessment: {
      anyOf: [{ $ref: "#/$defs/TrialAssessment" }, { type: "null" }],
      default: null,
    },
  },
  required: [
    "id",
    "scenario_id",
    "agent",
    "provider",
    "model",
    "returned_model",
    "source",
    "repetition",
    "status",
    "started_at",
    "latency_ms",
    "tool_calls",
    "invalid_actions",
    "usage",
    "estimated_cost_usd",
    "reserved_cost_usd",
    "usage_complete",
    "settings",
    "grade",
    "final_state",
    "events",
    "assessment",
  ],
  title: "TrialResult",
  type: "object",
};
const schema39 = {
  additionalProperties: false,
  properties: {
    input_tokens: {
      default: 0,
      minimum: 0,
      title: "Input Tokens",
      type: "integer",
    },
    output_tokens: {
      default: 0,
      minimum: 0,
      title: "Output Tokens",
      type: "integer",
    },
  },
  required: ["input_tokens", "output_tokens"],
  title: "Usage",
  type: "object",
};
const schema40 = {
  additionalProperties: false,
  properties: {
    success: { title: "Success", type: "boolean" },
    completed_requests: { title: "Completed Requests", type: "integer" },
    total_requests: { title: "Total Requests", type: "integer" },
    violations: {
      items: { type: "string" },
      title: "Violations",
      type: "array",
    },
  },
  required: ["success", "completed_requests", "total_requests", "violations"],
  title: "Grade",
  type: "object",
};
const schema41 = {
  additionalProperties: false,
  properties: {
    sequence: { title: "Sequence", type: "integer" },
    kind: {
      enum: ["tool", "message", "stopped"],
      title: "Kind",
      type: "string",
    },
    turn: { title: "Turn", type: "integer" },
    tool: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Tool",
    },
    arguments: {
      anyOf: [{ additionalProperties: true, type: "object" }, { type: "null" }],
      default: null,
      title: "Arguments",
    },
    result: {
      anyOf: [{ $ref: "#/$defs/ToolResult" }, { type: "null" }],
      default: null,
    },
    text: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Text",
    },
    state: { $ref: "#/$defs/RentalState" },
  },
  required: [
    "sequence",
    "kind",
    "turn",
    "tool",
    "arguments",
    "result",
    "text",
    "state",
  ],
  title: "TraceEvent",
  type: "object",
};
const schema42 = {
  additionalProperties: false,
  properties: {
    data: { additionalProperties: true, title: "Data", type: "object" },
    error: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Error",
    },
    fault: {
      anyOf: [
        {
          enum: [
            "transient_read",
            "car_unavailable",
            "committed_timeout",
            "prompt_injection",
            "no_matching_car",
            "competing_requests",
          ],
          type: "string",
        },
        { type: "null" },
      ],
      default: null,
      title: "Fault",
    },
  },
  required: ["data", "error", "fault"],
  title: "ToolResult",
  type: "object",
};
function validate27(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate27.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.sequence === undefined && (missing0 = "sequence")) ||
        (data.kind === undefined && (missing0 = "kind")) ||
        (data.turn === undefined && (missing0 = "turn")) ||
        (data.tool === undefined && (missing0 = "tool")) ||
        (data.arguments === undefined && (missing0 = "arguments")) ||
        (data.result === undefined && (missing0 = "result")) ||
        (data.text === undefined && (missing0 = "text")) ||
        (data.state === undefined && (missing0 = "state"))
      ) {
        validate27.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(
            key0 === "sequence" ||
            key0 === "kind" ||
            key0 === "turn" ||
            key0 === "tool" ||
            key0 === "arguments" ||
            key0 === "result" ||
            key0 === "text" ||
            key0 === "state"
          )) {
            validate27.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.sequence !== undefined) {
            let data0 = data.sequence;
            const _errs2 = errors;
            if (!(typeof data0 == "number" && !(data0 % 1) && !isNaN(data0))) {
              validate27.errors = [
                {
                  instancePath: instancePath + "/sequence",
                  schemaPath: "#/properties/sequence/type",
                  keyword: "type",
                  params: { type: "integer" },
                  message: "must be integer",
                },
              ];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.kind !== undefined) {
              let data1 = data.kind;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate27.errors = [
                  {
                    instancePath: instancePath + "/kind",
                    schemaPath: "#/properties/kind/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string",
                  },
                ];
                return false;
              }
              if (!(
                data1 === "tool" ||
                data1 === "message" ||
                data1 === "stopped"
              )) {
                validate27.errors = [
                  {
                    instancePath: instancePath + "/kind",
                    schemaPath: "#/properties/kind/enum",
                    keyword: "enum",
                    params: { allowedValues: schema41.properties.kind.enum },
                    message: "must be equal to one of the allowed values",
                  },
                ];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.turn !== undefined) {
                let data2 = data.turn;
                const _errs6 = errors;
                if (!(
                  typeof data2 == "number" &&
                  !(data2 % 1) &&
                  !isNaN(data2)
                )) {
                  validate27.errors = [
                    {
                      instancePath: instancePath + "/turn",
                      schemaPath: "#/properties/turn/type",
                      keyword: "type",
                      params: { type: "integer" },
                      message: "must be integer",
                    },
                  ];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.tool !== undefined) {
                  let data3 = data.tool;
                  const _errs8 = errors;
                  const _errs9 = errors;
                  let valid1 = false;
                  const _errs10 = errors;
                  if (typeof data3 !== "string") {
                    const err0 = {
                      instancePath: instancePath + "/tool",
                      schemaPath: "#/properties/tool/anyOf/0/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string",
                    };
                    if (vErrors === null) {
                      vErrors = [err0];
                    } else {
                      vErrors.push(err0);
                    }
                    errors++;
                  }
                  var _valid0 = _errs10 === errors;
                  valid1 = valid1 || _valid0;
                  const _errs12 = errors;
                  if (data3 !== null) {
                    const err1 = {
                      instancePath: instancePath + "/tool",
                      schemaPath: "#/properties/tool/anyOf/1/type",
                      keyword: "type",
                      params: { type: "null" },
                      message: "must be null",
                    };
                    if (vErrors === null) {
                      vErrors = [err1];
                    } else {
                      vErrors.push(err1);
                    }
                    errors++;
                  }
                  var _valid0 = _errs12 === errors;
                  valid1 = valid1 || _valid0;
                  if (!valid1) {
                    const err2 = {
                      instancePath: instancePath + "/tool",
                      schemaPath: "#/properties/tool/anyOf",
                      keyword: "anyOf",
                      params: {},
                      message: "must match a schema in anyOf",
                    };
                    if (vErrors === null) {
                      vErrors = [err2];
                    } else {
                      vErrors.push(err2);
                    }
                    errors++;
                    validate27.errors = vErrors;
                    return false;
                  } else {
                    errors = _errs9;
                    if (vErrors !== null) {
                      if (_errs9) {
                        vErrors.length = _errs9;
                      } else {
                        vErrors = null;
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.arguments !== undefined) {
                    let data4 = data.arguments;
                    const _errs14 = errors;
                    const _errs15 = errors;
                    let valid2 = false;
                    const _errs16 = errors;
                    if (errors === _errs16) {
                      if (
                        data4 &&
                        typeof data4 == "object" &&
                        !Array.isArray(data4)
                      ) {
                      } else {
                        const err3 = {
                          instancePath: instancePath + "/arguments",
                          schemaPath: "#/properties/arguments/anyOf/0/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object",
                        };
                        if (vErrors === null) {
                          vErrors = [err3];
                        } else {
                          vErrors.push(err3);
                        }
                        errors++;
                      }
                    }
                    var _valid1 = _errs16 === errors;
                    valid2 = valid2 || _valid1;
                    const _errs19 = errors;
                    if (data4 !== null) {
                      const err4 = {
                        instancePath: instancePath + "/arguments",
                        schemaPath: "#/properties/arguments/anyOf/1/type",
                        keyword: "type",
                        params: { type: "null" },
                        message: "must be null",
                      };
                      if (vErrors === null) {
                        vErrors = [err4];
                      } else {
                        vErrors.push(err4);
                      }
                      errors++;
                    }
                    var _valid1 = _errs19 === errors;
                    valid2 = valid2 || _valid1;
                    if (!valid2) {
                      const err5 = {
                        instancePath: instancePath + "/arguments",
                        schemaPath: "#/properties/arguments/anyOf",
                        keyword: "anyOf",
                        params: {},
                        message: "must match a schema in anyOf",
                      };
                      if (vErrors === null) {
                        vErrors = [err5];
                      } else {
                        vErrors.push(err5);
                      }
                      errors++;
                      validate27.errors = vErrors;
                      return false;
                    } else {
                      errors = _errs15;
                      if (vErrors !== null) {
                        if (_errs15) {
                          vErrors.length = _errs15;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var valid0 = _errs14 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.result !== undefined) {
                      let data5 = data.result;
                      const _errs21 = errors;
                      const _errs22 = errors;
                      let valid3 = false;
                      const _errs23 = errors;
                      const _errs24 = errors;
                      if (errors === _errs24) {
                        if (
                          data5 &&
                          typeof data5 == "object" &&
                          !Array.isArray(data5)
                        ) {
                          let missing1;
                          if (
                            (data5.data === undefined && (missing1 = "data")) ||
                            (data5.error === undefined &&
                              (missing1 = "error")) ||
                            (data5.fault === undefined && (missing1 = "fault"))
                          ) {
                            const err6 = {
                              instancePath: instancePath + "/result",
                              schemaPath: "#/$defs/ToolResult/required",
                              keyword: "required",
                              params: { missingProperty: missing1 },
                              message:
                                "must have required property '" +
                                missing1 +
                                "'",
                            };
                            if (vErrors === null) {
                              vErrors = [err6];
                            } else {
                              vErrors.push(err6);
                            }
                            errors++;
                          } else {
                            const _errs26 = errors;
                            for (const key1 in data5) {
                              if (!(
                                key1 === "data" ||
                                key1 === "error" ||
                                key1 === "fault"
                              )) {
                                const err7 = {
                                  instancePath: instancePath + "/result",
                                  schemaPath:
                                    "#/$defs/ToolResult/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: { additionalProperty: key1 },
                                  message:
                                    "must NOT have additional properties",
                                };
                                if (vErrors === null) {
                                  vErrors = [err7];
                                } else {
                                  vErrors.push(err7);
                                }
                                errors++;
                                break;
                              }
                            }
                            if (_errs26 === errors) {
                              if (data5.data !== undefined) {
                                let data6 = data5.data;
                                const _errs27 = errors;
                                if (errors === _errs27) {
                                  if (
                                    data6 &&
                                    typeof data6 == "object" &&
                                    !Array.isArray(data6)
                                  ) {
                                  } else {
                                    const err8 = {
                                      instancePath:
                                        instancePath + "/result/data",
                                      schemaPath:
                                        "#/$defs/ToolResult/properties/data/type",
                                      keyword: "type",
                                      params: { type: "object" },
                                      message: "must be object",
                                    };
                                    if (vErrors === null) {
                                      vErrors = [err8];
                                    } else {
                                      vErrors.push(err8);
                                    }
                                    errors++;
                                  }
                                }
                                var valid5 = _errs27 === errors;
                              } else {
                                var valid5 = true;
                              }
                              if (valid5) {
                                if (data5.error !== undefined) {
                                  let data7 = data5.error;
                                  const _errs30 = errors;
                                  const _errs31 = errors;
                                  let valid6 = false;
                                  const _errs32 = errors;
                                  if (typeof data7 !== "string") {
                                    const err9 = {
                                      instancePath:
                                        instancePath + "/result/error",
                                      schemaPath:
                                        "#/$defs/ToolResult/properties/error/anyOf/0/type",
                                      keyword: "type",
                                      params: { type: "string" },
                                      message: "must be string",
                                    };
                                    if (vErrors === null) {
                                      vErrors = [err9];
                                    } else {
                                      vErrors.push(err9);
                                    }
                                    errors++;
                                  }
                                  var _valid3 = _errs32 === errors;
                                  valid6 = valid6 || _valid3;
                                  const _errs34 = errors;
                                  if (data7 !== null) {
                                    const err10 = {
                                      instancePath:
                                        instancePath + "/result/error",
                                      schemaPath:
                                        "#/$defs/ToolResult/properties/error/anyOf/1/type",
                                      keyword: "type",
                                      params: { type: "null" },
                                      message: "must be null",
                                    };
                                    if (vErrors === null) {
                                      vErrors = [err10];
                                    } else {
                                      vErrors.push(err10);
                                    }
                                    errors++;
                                  }
                                  var _valid3 = _errs34 === errors;
                                  valid6 = valid6 || _valid3;
                                  if (!valid6) {
                                    const err11 = {
                                      instancePath:
                                        instancePath + "/result/error",
                                      schemaPath:
                                        "#/$defs/ToolResult/properties/error/anyOf",
                                      keyword: "anyOf",
                                      params: {},
                                      message: "must match a schema in anyOf",
                                    };
                                    if (vErrors === null) {
                                      vErrors = [err11];
                                    } else {
                                      vErrors.push(err11);
                                    }
                                    errors++;
                                  } else {
                                    errors = _errs31;
                                    if (vErrors !== null) {
                                      if (_errs31) {
                                        vErrors.length = _errs31;
                                      } else {
                                        vErrors = null;
                                      }
                                    }
                                  }
                                  var valid5 = _errs30 === errors;
                                } else {
                                  var valid5 = true;
                                }
                                if (valid5) {
                                  if (data5.fault !== undefined) {
                                    let data8 = data5.fault;
                                    const _errs36 = errors;
                                    const _errs37 = errors;
                                    let valid7 = false;
                                    const _errs38 = errors;
                                    if (typeof data8 !== "string") {
                                      const err12 = {
                                        instancePath:
                                          instancePath + "/result/fault",
                                        schemaPath:
                                          "#/$defs/ToolResult/properties/fault/anyOf/0/type",
                                        keyword: "type",
                                        params: { type: "string" },
                                        message: "must be string",
                                      };
                                      if (vErrors === null) {
                                        vErrors = [err12];
                                      } else {
                                        vErrors.push(err12);
                                      }
                                      errors++;
                                    }
                                    if (!(
                                      data8 === "transient_read" ||
                                      data8 === "car_unavailable" ||
                                      data8 === "committed_timeout" ||
                                      data8 === "prompt_injection" ||
                                      data8 === "no_matching_car" ||
                                      data8 === "competing_requests"
                                    )) {
                                      const err13 = {
                                        instancePath:
                                          instancePath + "/result/fault",
                                        schemaPath:
                                          "#/$defs/ToolResult/properties/fault/anyOf/0/enum",
                                        keyword: "enum",
                                        params: {
                                          allowedValues:
                                            schema42.properties.fault.anyOf[0]
                                              .enum,
                                        },
                                        message:
                                          "must be equal to one of the allowed values",
                                      };
                                      if (vErrors === null) {
                                        vErrors = [err13];
                                      } else {
                                        vErrors.push(err13);
                                      }
                                      errors++;
                                    }
                                    var _valid4 = _errs38 === errors;
                                    valid7 = valid7 || _valid4;
                                    const _errs40 = errors;
                                    if (data8 !== null) {
                                      const err14 = {
                                        instancePath:
                                          instancePath + "/result/fault",
                                        schemaPath:
                                          "#/$defs/ToolResult/properties/fault/anyOf/1/type",
                                        keyword: "type",
                                        params: { type: "null" },
                                        message: "must be null",
                                      };
                                      if (vErrors === null) {
                                        vErrors = [err14];
                                      } else {
                                        vErrors.push(err14);
                                      }
                                      errors++;
                                    }
                                    var _valid4 = _errs40 === errors;
                                    valid7 = valid7 || _valid4;
                                    if (!valid7) {
                                      const err15 = {
                                        instancePath:
                                          instancePath + "/result/fault",
                                        schemaPath:
                                          "#/$defs/ToolResult/properties/fault/anyOf",
                                        keyword: "anyOf",
                                        params: {},
                                        message: "must match a schema in anyOf",
                                      };
                                      if (vErrors === null) {
                                        vErrors = [err15];
                                      } else {
                                        vErrors.push(err15);
                                      }
                                      errors++;
                                    } else {
                                      errors = _errs37;
                                      if (vErrors !== null) {
                                        if (_errs37) {
                                          vErrors.length = _errs37;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid5 = _errs36 === errors;
                                  } else {
                                    var valid5 = true;
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          const err16 = {
                            instancePath: instancePath + "/result",
                            schemaPath: "#/$defs/ToolResult/type",
                            keyword: "type",
                            params: { type: "object" },
                            message: "must be object",
                          };
                          if (vErrors === null) {
                            vErrors = [err16];
                          } else {
                            vErrors.push(err16);
                          }
                          errors++;
                        }
                      }
                      var _valid2 = _errs23 === errors;
                      valid3 = valid3 || _valid2;
                      const _errs42 = errors;
                      if (data5 !== null) {
                        const err17 = {
                          instancePath: instancePath + "/result",
                          schemaPath: "#/properties/result/anyOf/1/type",
                          keyword: "type",
                          params: { type: "null" },
                          message: "must be null",
                        };
                        if (vErrors === null) {
                          vErrors = [err17];
                        } else {
                          vErrors.push(err17);
                        }
                        errors++;
                      }
                      var _valid2 = _errs42 === errors;
                      valid3 = valid3 || _valid2;
                      if (!valid3) {
                        const err18 = {
                          instancePath: instancePath + "/result",
                          schemaPath: "#/properties/result/anyOf",
                          keyword: "anyOf",
                          params: {},
                          message: "must match a schema in anyOf",
                        };
                        if (vErrors === null) {
                          vErrors = [err18];
                        } else {
                          vErrors.push(err18);
                        }
                        errors++;
                        validate27.errors = vErrors;
                        return false;
                      } else {
                        errors = _errs22;
                        if (vErrors !== null) {
                          if (_errs22) {
                            vErrors.length = _errs22;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      var valid0 = _errs21 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.text !== undefined) {
                        let data9 = data.text;
                        const _errs44 = errors;
                        const _errs45 = errors;
                        let valid8 = false;
                        const _errs46 = errors;
                        if (typeof data9 !== "string") {
                          const err19 = {
                            instancePath: instancePath + "/text",
                            schemaPath: "#/properties/text/anyOf/0/type",
                            keyword: "type",
                            params: { type: "string" },
                            message: "must be string",
                          };
                          if (vErrors === null) {
                            vErrors = [err19];
                          } else {
                            vErrors.push(err19);
                          }
                          errors++;
                        }
                        var _valid5 = _errs46 === errors;
                        valid8 = valid8 || _valid5;
                        const _errs48 = errors;
                        if (data9 !== null) {
                          const err20 = {
                            instancePath: instancePath + "/text",
                            schemaPath: "#/properties/text/anyOf/1/type",
                            keyword: "type",
                            params: { type: "null" },
                            message: "must be null",
                          };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        }
                        var _valid5 = _errs48 === errors;
                        valid8 = valid8 || _valid5;
                        if (!valid8) {
                          const err21 = {
                            instancePath: instancePath + "/text",
                            schemaPath: "#/properties/text/anyOf",
                            keyword: "anyOf",
                            params: {},
                            message: "must match a schema in anyOf",
                          };
                          if (vErrors === null) {
                            vErrors = [err21];
                          } else {
                            vErrors.push(err21);
                          }
                          errors++;
                          validate27.errors = vErrors;
                          return false;
                        } else {
                          errors = _errs45;
                          if (vErrors !== null) {
                            if (_errs45) {
                              vErrors.length = _errs45;
                            } else {
                              vErrors = null;
                            }
                          }
                        }
                        var valid0 = _errs44 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.state !== undefined) {
                          const _errs50 = errors;
                          if (
                            !validate22(data.state, {
                              instancePath: instancePath + "/state",
                              parentData: data,
                              parentDataProperty: "state",
                              rootData,
                              dynamicAnchors,
                            })
                          ) {
                            vErrors =
                              vErrors === null
                                ? validate22.errors
                                : vErrors.concat(validate22.errors);
                            errors = vErrors.length;
                          }
                          var valid0 = _errs50 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate27.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
const schema43 = {
  additionalProperties: false,
  properties: {
    grader_version: {
      const: "1.0",
      default: "1.0",
      title: "Grader Version",
      type: "string",
    },
    checks: {
      items: { $ref: "#/$defs/EvaluationCheck" },
      title: "Checks",
      type: "array",
    },
    steps: {
      items: { $ref: "#/$defs/StepAssessment" },
      title: "Steps",
      type: "array",
    },
    turns: { title: "Turns", type: "integer" },
    repeated_reads: { title: "Repeated Reads", type: "integer" },
    safe_retries: { title: "Safe Retries", type: "integer" },
  },
  required: [
    "grader_version",
    "checks",
    "steps",
    "turns",
    "repeated_reads",
    "safe_retries",
  ],
  title: "TrialAssessment",
  type: "object",
};
const schema44 = {
  additionalProperties: false,
  properties: {
    id: { title: "Id", type: "string" },
    category: { title: "Category", type: "string" },
    title: { title: "Title", type: "string" },
    verdict: {
      enum: ["pass", "fail", "not_applicable", "not_assessed"],
      title: "Verdict",
      type: "string",
    },
    detail: { title: "Detail", type: "string" },
    evidence_sequences: {
      items: { type: "integer" },
      title: "Evidence Sequences",
      type: "array",
    },
  },
  required: [
    "id",
    "category",
    "title",
    "verdict",
    "detail",
    "evidence_sequences",
  ],
  title: "EvaluationCheck",
  type: "object",
};
const schema45 = {
  additionalProperties: false,
  properties: {
    sequence: { title: "Sequence", type: "integer" },
    verdict: {
      enum: ["accepted", "rejected", "disrupted"],
      title: "Verdict",
      type: "string",
    },
    detail: { title: "Detail", type: "string" },
  },
  required: ["sequence", "verdict", "detail"],
  title: "StepAssessment",
  type: "object",
};
function validate30(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.grader_version === undefined && (missing0 = "grader_version")) ||
        (data.checks === undefined && (missing0 = "checks")) ||
        (data.steps === undefined && (missing0 = "steps")) ||
        (data.turns === undefined && (missing0 = "turns")) ||
        (data.repeated_reads === undefined && (missing0 = "repeated_reads")) ||
        (data.safe_retries === undefined && (missing0 = "safe_retries"))
      ) {
        validate30.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(
            key0 === "grader_version" ||
            key0 === "checks" ||
            key0 === "steps" ||
            key0 === "turns" ||
            key0 === "repeated_reads" ||
            key0 === "safe_retries"
          )) {
            validate30.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.grader_version !== undefined) {
            let data0 = data.grader_version;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate30.errors = [
                {
                  instancePath: instancePath + "/grader_version",
                  schemaPath: "#/properties/grader_version/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                },
              ];
              return false;
            }
            if ("1.0" !== data0) {
              validate30.errors = [
                {
                  instancePath: instancePath + "/grader_version",
                  schemaPath: "#/properties/grader_version/const",
                  keyword: "const",
                  params: { allowedValue: "1.0" },
                  message: "must be equal to constant",
                },
              ];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.checks !== undefined) {
              let data1 = data.checks;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data1)) {
                  var valid1 = true;
                  const len0 = data1.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    let data2 = data1[i0];
                    const _errs6 = errors;
                    const _errs7 = errors;
                    if (errors === _errs7) {
                      if (
                        data2 &&
                        typeof data2 == "object" &&
                        !Array.isArray(data2)
                      ) {
                        let missing1;
                        if (
                          (data2.id === undefined && (missing1 = "id")) ||
                          (data2.category === undefined &&
                            (missing1 = "category")) ||
                          (data2.title === undefined && (missing1 = "title")) ||
                          (data2.verdict === undefined &&
                            (missing1 = "verdict")) ||
                          (data2.detail === undefined &&
                            (missing1 = "detail")) ||
                          (data2.evidence_sequences === undefined &&
                            (missing1 = "evidence_sequences"))
                        ) {
                          validate30.errors = [
                            {
                              instancePath: instancePath + "/checks/" + i0,
                              schemaPath: "#/$defs/EvaluationCheck/required",
                              keyword: "required",
                              params: { missingProperty: missing1 },
                              message:
                                "must have required property '" +
                                missing1 +
                                "'",
                            },
                          ];
                          return false;
                        } else {
                          const _errs9 = errors;
                          for (const key1 in data2) {
                            if (!(
                              key1 === "id" ||
                              key1 === "category" ||
                              key1 === "title" ||
                              key1 === "verdict" ||
                              key1 === "detail" ||
                              key1 === "evidence_sequences"
                            )) {
                              validate30.errors = [
                                {
                                  instancePath: instancePath + "/checks/" + i0,
                                  schemaPath:
                                    "#/$defs/EvaluationCheck/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: { additionalProperty: key1 },
                                  message:
                                    "must NOT have additional properties",
                                },
                              ];
                              return false;
                              break;
                            }
                          }
                          if (_errs9 === errors) {
                            if (data2.id !== undefined) {
                              const _errs10 = errors;
                              if (typeof data2.id !== "string") {
                                validate30.errors = [
                                  {
                                    instancePath:
                                      instancePath + "/checks/" + i0 + "/id",
                                    schemaPath:
                                      "#/$defs/EvaluationCheck/properties/id/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  },
                                ];
                                return false;
                              }
                              var valid3 = _errs10 === errors;
                            } else {
                              var valid3 = true;
                            }
                            if (valid3) {
                              if (data2.category !== undefined) {
                                const _errs12 = errors;
                                if (typeof data2.category !== "string") {
                                  validate30.errors = [
                                    {
                                      instancePath:
                                        instancePath +
                                        "/checks/" +
                                        i0 +
                                        "/category",
                                      schemaPath:
                                        "#/$defs/EvaluationCheck/properties/category/type",
                                      keyword: "type",
                                      params: { type: "string" },
                                      message: "must be string",
                                    },
                                  ];
                                  return false;
                                }
                                var valid3 = _errs12 === errors;
                              } else {
                                var valid3 = true;
                              }
                              if (valid3) {
                                if (data2.title !== undefined) {
                                  const _errs14 = errors;
                                  if (typeof data2.title !== "string") {
                                    validate30.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/checks/" +
                                          i0 +
                                          "/title",
                                        schemaPath:
                                          "#/$defs/EvaluationCheck/properties/title/type",
                                        keyword: "type",
                                        params: { type: "string" },
                                        message: "must be string",
                                      },
                                    ];
                                    return false;
                                  }
                                  var valid3 = _errs14 === errors;
                                } else {
                                  var valid3 = true;
                                }
                                if (valid3) {
                                  if (data2.verdict !== undefined) {
                                    let data6 = data2.verdict;
                                    const _errs16 = errors;
                                    if (typeof data6 !== "string") {
                                      validate30.errors = [
                                        {
                                          instancePath:
                                            instancePath +
                                            "/checks/" +
                                            i0 +
                                            "/verdict",
                                          schemaPath:
                                            "#/$defs/EvaluationCheck/properties/verdict/type",
                                          keyword: "type",
                                          params: { type: "string" },
                                          message: "must be string",
                                        },
                                      ];
                                      return false;
                                    }
                                    if (!(
                                      data6 === "pass" ||
                                      data6 === "fail" ||
                                      data6 === "not_applicable" ||
                                      data6 === "not_assessed"
                                    )) {
                                      validate30.errors = [
                                        {
                                          instancePath:
                                            instancePath +
                                            "/checks/" +
                                            i0 +
                                            "/verdict",
                                          schemaPath:
                                            "#/$defs/EvaluationCheck/properties/verdict/enum",
                                          keyword: "enum",
                                          params: {
                                            allowedValues:
                                              schema44.properties.verdict.enum,
                                          },
                                          message:
                                            "must be equal to one of the allowed values",
                                        },
                                      ];
                                      return false;
                                    }
                                    var valid3 = _errs16 === errors;
                                  } else {
                                    var valid3 = true;
                                  }
                                  if (valid3) {
                                    if (data2.detail !== undefined) {
                                      const _errs18 = errors;
                                      if (typeof data2.detail !== "string") {
                                        validate30.errors = [
                                          {
                                            instancePath:
                                              instancePath +
                                              "/checks/" +
                                              i0 +
                                              "/detail",
                                            schemaPath:
                                              "#/$defs/EvaluationCheck/properties/detail/type",
                                            keyword: "type",
                                            params: { type: "string" },
                                            message: "must be string",
                                          },
                                        ];
                                        return false;
                                      }
                                      var valid3 = _errs18 === errors;
                                    } else {
                                      var valid3 = true;
                                    }
                                    if (valid3) {
                                      if (
                                        data2.evidence_sequences !== undefined
                                      ) {
                                        let data8 = data2.evidence_sequences;
                                        const _errs20 = errors;
                                        if (errors === _errs20) {
                                          if (Array.isArray(data8)) {
                                            var valid4 = true;
                                            const len1 = data8.length;
                                            for (let i1 = 0; i1 < len1; i1++) {
                                              let data9 = data8[i1];
                                              const _errs22 = errors;
                                              if (!(
                                                typeof data9 == "number" &&
                                                !(data9 % 1) &&
                                                !isNaN(data9)
                                              )) {
                                                validate30.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath +
                                                      "/checks/" +
                                                      i0 +
                                                      "/evidence_sequences/" +
                                                      i1,
                                                    schemaPath:
                                                      "#/$defs/EvaluationCheck/properties/evidence_sequences/items/type",
                                                    keyword: "type",
                                                    params: { type: "integer" },
                                                    message: "must be integer",
                                                  },
                                                ];
                                                return false;
                                              }
                                              var valid4 = _errs22 === errors;
                                              if (!valid4) {
                                                break;
                                              }
                                            }
                                          } else {
                                            validate30.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/checks/" +
                                                  i0 +
                                                  "/evidence_sequences",
                                                schemaPath:
                                                  "#/$defs/EvaluationCheck/properties/evidence_sequences/type",
                                                keyword: "type",
                                                params: { type: "array" },
                                                message: "must be array",
                                              },
                                            ];
                                            return false;
                                          }
                                        }
                                        var valid3 = _errs20 === errors;
                                      } else {
                                        var valid3 = true;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        validate30.errors = [
                          {
                            instancePath: instancePath + "/checks/" + i0,
                            schemaPath: "#/$defs/EvaluationCheck/type",
                            keyword: "type",
                            params: { type: "object" },
                            message: "must be object",
                          },
                        ];
                        return false;
                      }
                    }
                    var valid1 = _errs6 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                } else {
                  validate30.errors = [
                    {
                      instancePath: instancePath + "/checks",
                      schemaPath: "#/properties/checks/type",
                      keyword: "type",
                      params: { type: "array" },
                      message: "must be array",
                    },
                  ];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.steps !== undefined) {
                let data10 = data.steps;
                const _errs24 = errors;
                if (errors === _errs24) {
                  if (Array.isArray(data10)) {
                    var valid5 = true;
                    const len2 = data10.length;
                    for (let i2 = 0; i2 < len2; i2++) {
                      let data11 = data10[i2];
                      const _errs26 = errors;
                      const _errs27 = errors;
                      if (errors === _errs27) {
                        if (
                          data11 &&
                          typeof data11 == "object" &&
                          !Array.isArray(data11)
                        ) {
                          let missing2;
                          if (
                            (data11.sequence === undefined &&
                              (missing2 = "sequence")) ||
                            (data11.verdict === undefined &&
                              (missing2 = "verdict")) ||
                            (data11.detail === undefined &&
                              (missing2 = "detail"))
                          ) {
                            validate30.errors = [
                              {
                                instancePath: instancePath + "/steps/" + i2,
                                schemaPath: "#/$defs/StepAssessment/required",
                                keyword: "required",
                                params: { missingProperty: missing2 },
                                message:
                                  "must have required property '" +
                                  missing2 +
                                  "'",
                              },
                            ];
                            return false;
                          } else {
                            const _errs29 = errors;
                            for (const key2 in data11) {
                              if (!(
                                key2 === "sequence" ||
                                key2 === "verdict" ||
                                key2 === "detail"
                              )) {
                                validate30.errors = [
                                  {
                                    instancePath: instancePath + "/steps/" + i2,
                                    schemaPath:
                                      "#/$defs/StepAssessment/additionalProperties",
                                    keyword: "additionalProperties",
                                    params: { additionalProperty: key2 },
                                    message:
                                      "must NOT have additional properties",
                                  },
                                ];
                                return false;
                                break;
                              }
                            }
                            if (_errs29 === errors) {
                              if (data11.sequence !== undefined) {
                                let data12 = data11.sequence;
                                const _errs30 = errors;
                                if (!(
                                  typeof data12 == "number" &&
                                  !(data12 % 1) &&
                                  !isNaN(data12)
                                )) {
                                  validate30.errors = [
                                    {
                                      instancePath:
                                        instancePath +
                                        "/steps/" +
                                        i2 +
                                        "/sequence",
                                      schemaPath:
                                        "#/$defs/StepAssessment/properties/sequence/type",
                                      keyword: "type",
                                      params: { type: "integer" },
                                      message: "must be integer",
                                    },
                                  ];
                                  return false;
                                }
                                var valid7 = _errs30 === errors;
                              } else {
                                var valid7 = true;
                              }
                              if (valid7) {
                                if (data11.verdict !== undefined) {
                                  let data13 = data11.verdict;
                                  const _errs32 = errors;
                                  if (typeof data13 !== "string") {
                                    validate30.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/steps/" +
                                          i2 +
                                          "/verdict",
                                        schemaPath:
                                          "#/$defs/StepAssessment/properties/verdict/type",
                                        keyword: "type",
                                        params: { type: "string" },
                                        message: "must be string",
                                      },
                                    ];
                                    return false;
                                  }
                                  if (!(
                                    data13 === "accepted" ||
                                    data13 === "rejected" ||
                                    data13 === "disrupted"
                                  )) {
                                    validate30.errors = [
                                      {
                                        instancePath:
                                          instancePath +
                                          "/steps/" +
                                          i2 +
                                          "/verdict",
                                        schemaPath:
                                          "#/$defs/StepAssessment/properties/verdict/enum",
                                        keyword: "enum",
                                        params: {
                                          allowedValues:
                                            schema45.properties.verdict.enum,
                                        },
                                        message:
                                          "must be equal to one of the allowed values",
                                      },
                                    ];
                                    return false;
                                  }
                                  var valid7 = _errs32 === errors;
                                } else {
                                  var valid7 = true;
                                }
                                if (valid7) {
                                  if (data11.detail !== undefined) {
                                    const _errs34 = errors;
                                    if (typeof data11.detail !== "string") {
                                      validate30.errors = [
                                        {
                                          instancePath:
                                            instancePath +
                                            "/steps/" +
                                            i2 +
                                            "/detail",
                                          schemaPath:
                                            "#/$defs/StepAssessment/properties/detail/type",
                                          keyword: "type",
                                          params: { type: "string" },
                                          message: "must be string",
                                        },
                                      ];
                                      return false;
                                    }
                                    var valid7 = _errs34 === errors;
                                  } else {
                                    var valid7 = true;
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          validate30.errors = [
                            {
                              instancePath: instancePath + "/steps/" + i2,
                              schemaPath: "#/$defs/StepAssessment/type",
                              keyword: "type",
                              params: { type: "object" },
                              message: "must be object",
                            },
                          ];
                          return false;
                        }
                      }
                      var valid5 = _errs26 === errors;
                      if (!valid5) {
                        break;
                      }
                    }
                  } else {
                    validate30.errors = [
                      {
                        instancePath: instancePath + "/steps",
                        schemaPath: "#/properties/steps/type",
                        keyword: "type",
                        params: { type: "array" },
                        message: "must be array",
                      },
                    ];
                    return false;
                  }
                }
                var valid0 = _errs24 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.turns !== undefined) {
                  let data15 = data.turns;
                  const _errs36 = errors;
                  if (!(
                    typeof data15 == "number" &&
                    !(data15 % 1) &&
                    !isNaN(data15)
                  )) {
                    validate30.errors = [
                      {
                        instancePath: instancePath + "/turns",
                        schemaPath: "#/properties/turns/type",
                        keyword: "type",
                        params: { type: "integer" },
                        message: "must be integer",
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs36 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.repeated_reads !== undefined) {
                    let data16 = data.repeated_reads;
                    const _errs38 = errors;
                    if (!(
                      typeof data16 == "number" &&
                      !(data16 % 1) &&
                      !isNaN(data16)
                    )) {
                      validate30.errors = [
                        {
                          instancePath: instancePath + "/repeated_reads",
                          schemaPath: "#/properties/repeated_reads/type",
                          keyword: "type",
                          params: { type: "integer" },
                          message: "must be integer",
                        },
                      ];
                      return false;
                    }
                    var valid0 = _errs38 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.safe_retries !== undefined) {
                      let data17 = data.safe_retries;
                      const _errs40 = errors;
                      if (!(
                        typeof data17 == "number" &&
                        !(data17 % 1) &&
                        !isNaN(data17)
                      )) {
                        validate30.errors = [
                          {
                            instancePath: instancePath + "/safe_retries",
                            schemaPath: "#/properties/safe_retries/type",
                            keyword: "type",
                            params: { type: "integer" },
                            message: "must be integer",
                          },
                        ];
                        return false;
                      }
                      var valid0 = _errs40 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate30.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
function validate25(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate25.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.id === undefined && (missing0 = "id")) ||
        (data.scenario_id === undefined && (missing0 = "scenario_id")) ||
        (data.agent === undefined && (missing0 = "agent")) ||
        (data.provider === undefined && (missing0 = "provider")) ||
        (data.model === undefined && (missing0 = "model")) ||
        (data.returned_model === undefined && (missing0 = "returned_model")) ||
        (data.source === undefined && (missing0 = "source")) ||
        (data.repetition === undefined && (missing0 = "repetition")) ||
        (data.status === undefined && (missing0 = "status")) ||
        (data.started_at === undefined && (missing0 = "started_at")) ||
        (data.latency_ms === undefined && (missing0 = "latency_ms")) ||
        (data.tool_calls === undefined && (missing0 = "tool_calls")) ||
        (data.invalid_actions === undefined &&
          (missing0 = "invalid_actions")) ||
        (data.usage === undefined && (missing0 = "usage")) ||
        (data.estimated_cost_usd === undefined &&
          (missing0 = "estimated_cost_usd")) ||
        (data.reserved_cost_usd === undefined &&
          (missing0 = "reserved_cost_usd")) ||
        (data.usage_complete === undefined && (missing0 = "usage_complete")) ||
        (data.settings === undefined && (missing0 = "settings")) ||
        (data.grade === undefined && (missing0 = "grade")) ||
        (data.final_state === undefined && (missing0 = "final_state")) ||
        (data.events === undefined && (missing0 = "events")) ||
        (data.assessment === undefined && (missing0 = "assessment"))
      ) {
        validate25.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func1.call(schema38.properties, key0)) {
            validate25.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== undefined) {
            const _errs2 = errors;
            if (typeof data.id !== "string") {
              validate25.errors = [
                {
                  instancePath: instancePath + "/id",
                  schemaPath: "#/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                },
              ];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.scenario_id !== undefined) {
              const _errs4 = errors;
              if (typeof data.scenario_id !== "string") {
                validate25.errors = [
                  {
                    instancePath: instancePath + "/scenario_id",
                    schemaPath: "#/properties/scenario_id/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string",
                  },
                ];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.agent !== undefined) {
                const _errs6 = errors;
                if (typeof data.agent !== "string") {
                  validate25.errors = [
                    {
                      instancePath: instancePath + "/agent",
                      schemaPath: "#/properties/agent/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string",
                    },
                  ];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.provider !== undefined) {
                  const _errs8 = errors;
                  if (typeof data.provider !== "string") {
                    validate25.errors = [
                      {
                        instancePath: instancePath + "/provider",
                        schemaPath: "#/properties/provider/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string",
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.model !== undefined) {
                    const _errs10 = errors;
                    if (typeof data.model !== "string") {
                      validate25.errors = [
                        {
                          instancePath: instancePath + "/model",
                          schemaPath: "#/properties/model/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        },
                      ];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.returned_model !== undefined) {
                      let data5 = data.returned_model;
                      const _errs12 = errors;
                      const _errs13 = errors;
                      let valid1 = false;
                      const _errs14 = errors;
                      if (typeof data5 !== "string") {
                        const err0 = {
                          instancePath: instancePath + "/returned_model",
                          schemaPath:
                            "#/properties/returned_model/anyOf/0/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        };
                        if (vErrors === null) {
                          vErrors = [err0];
                        } else {
                          vErrors.push(err0);
                        }
                        errors++;
                      }
                      var _valid0 = _errs14 === errors;
                      valid1 = valid1 || _valid0;
                      const _errs16 = errors;
                      if (data5 !== null) {
                        const err1 = {
                          instancePath: instancePath + "/returned_model",
                          schemaPath:
                            "#/properties/returned_model/anyOf/1/type",
                          keyword: "type",
                          params: { type: "null" },
                          message: "must be null",
                        };
                        if (vErrors === null) {
                          vErrors = [err1];
                        } else {
                          vErrors.push(err1);
                        }
                        errors++;
                      }
                      var _valid0 = _errs16 === errors;
                      valid1 = valid1 || _valid0;
                      if (!valid1) {
                        const err2 = {
                          instancePath: instancePath + "/returned_model",
                          schemaPath: "#/properties/returned_model/anyOf",
                          keyword: "anyOf",
                          params: {},
                          message: "must match a schema in anyOf",
                        };
                        if (vErrors === null) {
                          vErrors = [err2];
                        } else {
                          vErrors.push(err2);
                        }
                        errors++;
                        validate25.errors = vErrors;
                        return false;
                      } else {
                        errors = _errs13;
                        if (vErrors !== null) {
                          if (_errs13) {
                            vErrors.length = _errs13;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.source !== undefined) {
                        let data6 = data.source;
                        const _errs18 = errors;
                        if (typeof data6 !== "string") {
                          validate25.errors = [
                            {
                              instancePath: instancePath + "/source",
                              schemaPath: "#/properties/source/type",
                              keyword: "type",
                              params: { type: "string" },
                              message: "must be string",
                            },
                          ];
                          return false;
                        }
                        if (!(data6 === "scripted" || data6 === "live")) {
                          validate25.errors = [
                            {
                              instancePath: instancePath + "/source",
                              schemaPath: "#/properties/source/enum",
                              keyword: "enum",
                              params: {
                                allowedValues: schema38.properties.source.enum,
                              },
                              message:
                                "must be equal to one of the allowed values",
                            },
                          ];
                          return false;
                        }
                        var valid0 = _errs18 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.repetition !== undefined) {
                          let data7 = data.repetition;
                          const _errs20 = errors;
                          if (!(
                            typeof data7 == "number" &&
                            !(data7 % 1) &&
                            !isNaN(data7)
                          )) {
                            validate25.errors = [
                              {
                                instancePath: instancePath + "/repetition",
                                schemaPath: "#/properties/repetition/type",
                                keyword: "type",
                                params: { type: "integer" },
                                message: "must be integer",
                              },
                            ];
                            return false;
                          }
                          var valid0 = _errs20 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.status !== undefined) {
                            let data8 = data.status;
                            const _errs22 = errors;
                            if (typeof data8 !== "string") {
                              validate25.errors = [
                                {
                                  instancePath: instancePath + "/status",
                                  schemaPath: "#/properties/status/type",
                                  keyword: "type",
                                  params: { type: "string" },
                                  message: "must be string",
                                },
                              ];
                              return false;
                            }
                            if (!(
                              data8 === "completed" ||
                              data8 === "turn_limit" ||
                              data8 === "tool_limit" ||
                              data8 === "provider_error" ||
                              data8 === "budget_exhausted" ||
                              data8 === "input_limit" ||
                              data8 === "output_truncated" ||
                              data8 === "interrupted" ||
                              data8 === "not_run"
                            )) {
                              validate25.errors = [
                                {
                                  instancePath: instancePath + "/status",
                                  schemaPath: "#/properties/status/enum",
                                  keyword: "enum",
                                  params: {
                                    allowedValues:
                                      schema38.properties.status.enum,
                                  },
                                  message:
                                    "must be equal to one of the allowed values",
                                },
                              ];
                              return false;
                            }
                            var valid0 = _errs22 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.started_at !== undefined) {
                              const _errs24 = errors;
                              if (typeof data.started_at !== "string") {
                                validate25.errors = [
                                  {
                                    instancePath: instancePath + "/started_at",
                                    schemaPath: "#/properties/started_at/type",
                                    keyword: "type",
                                    params: { type: "string" },
                                    message: "must be string",
                                  },
                                ];
                                return false;
                              }
                              var valid0 = _errs24 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.latency_ms !== undefined) {
                                let data10 = data.latency_ms;
                                const _errs26 = errors;
                                if (errors === _errs26) {
                                  if (typeof data10 == "number") {
                                    if (data10 < 0 || isNaN(data10)) {
                                      validate25.errors = [
                                        {
                                          instancePath:
                                            instancePath + "/latency_ms",
                                          schemaPath:
                                            "#/properties/latency_ms/minimum",
                                          keyword: "minimum",
                                          params: {
                                            comparison: ">=",
                                            limit: 0,
                                          },
                                          message: "must be >= 0",
                                        },
                                      ];
                                      return false;
                                    }
                                  } else {
                                    validate25.errors = [
                                      {
                                        instancePath:
                                          instancePath + "/latency_ms",
                                        schemaPath:
                                          "#/properties/latency_ms/type",
                                        keyword: "type",
                                        params: { type: "number" },
                                        message: "must be number",
                                      },
                                    ];
                                    return false;
                                  }
                                }
                                var valid0 = _errs26 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.tool_calls !== undefined) {
                                  let data11 = data.tool_calls;
                                  const _errs28 = errors;
                                  if (!(
                                    typeof data11 == "number" &&
                                    !(data11 % 1) &&
                                    !isNaN(data11)
                                  )) {
                                    validate25.errors = [
                                      {
                                        instancePath:
                                          instancePath + "/tool_calls",
                                        schemaPath:
                                          "#/properties/tool_calls/type",
                                        keyword: "type",
                                        params: { type: "integer" },
                                        message: "must be integer",
                                      },
                                    ];
                                    return false;
                                  }
                                  if (errors === _errs28) {
                                    if (typeof data11 == "number") {
                                      if (data11 < 0 || isNaN(data11)) {
                                        validate25.errors = [
                                          {
                                            instancePath:
                                              instancePath + "/tool_calls",
                                            schemaPath:
                                              "#/properties/tool_calls/minimum",
                                            keyword: "minimum",
                                            params: {
                                              comparison: ">=",
                                              limit: 0,
                                            },
                                            message: "must be >= 0",
                                          },
                                        ];
                                        return false;
                                      }
                                    }
                                  }
                                  var valid0 = _errs28 === errors;
                                } else {
                                  var valid0 = true;
                                }
                                if (valid0) {
                                  if (data.invalid_actions !== undefined) {
                                    let data12 = data.invalid_actions;
                                    const _errs30 = errors;
                                    if (!(
                                      typeof data12 == "number" &&
                                      !(data12 % 1) &&
                                      !isNaN(data12)
                                    )) {
                                      validate25.errors = [
                                        {
                                          instancePath:
                                            instancePath + "/invalid_actions",
                                          schemaPath:
                                            "#/properties/invalid_actions/type",
                                          keyword: "type",
                                          params: { type: "integer" },
                                          message: "must be integer",
                                        },
                                      ];
                                      return false;
                                    }
                                    if (errors === _errs30) {
                                      if (typeof data12 == "number") {
                                        if (data12 < 0 || isNaN(data12)) {
                                          validate25.errors = [
                                            {
                                              instancePath:
                                                instancePath +
                                                "/invalid_actions",
                                              schemaPath:
                                                "#/properties/invalid_actions/minimum",
                                              keyword: "minimum",
                                              params: {
                                                comparison: ">=",
                                                limit: 0,
                                              },
                                              message: "must be >= 0",
                                            },
                                          ];
                                          return false;
                                        }
                                      }
                                    }
                                    var valid0 = _errs30 === errors;
                                  } else {
                                    var valid0 = true;
                                  }
                                  if (valid0) {
                                    if (data.usage !== undefined) {
                                      let data13 = data.usage;
                                      const _errs32 = errors;
                                      const _errs33 = errors;
                                      if (errors === _errs33) {
                                        if (
                                          data13 &&
                                          typeof data13 == "object" &&
                                          !Array.isArray(data13)
                                        ) {
                                          let missing1;
                                          if (
                                            (data13.input_tokens ===
                                              undefined &&
                                              (missing1 = "input_tokens")) ||
                                            (data13.output_tokens ===
                                              undefined &&
                                              (missing1 = "output_tokens"))
                                          ) {
                                            validate25.errors = [
                                              {
                                                instancePath:
                                                  instancePath + "/usage",
                                                schemaPath:
                                                  "#/$defs/Usage/required",
                                                keyword: "required",
                                                params: {
                                                  missingProperty: missing1,
                                                },
                                                message:
                                                  "must have required property '" +
                                                  missing1 +
                                                  "'",
                                              },
                                            ];
                                            return false;
                                          } else {
                                            const _errs35 = errors;
                                            for (const key1 in data13) {
                                              if (!(
                                                key1 === "input_tokens" ||
                                                key1 === "output_tokens"
                                              )) {
                                                validate25.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath + "/usage",
                                                    schemaPath:
                                                      "#/$defs/Usage/additionalProperties",
                                                    keyword:
                                                      "additionalProperties",
                                                    params: {
                                                      additionalProperty: key1,
                                                    },
                                                    message:
                                                      "must NOT have additional properties",
                                                  },
                                                ];
                                                return false;
                                                break;
                                              }
                                            }
                                            if (_errs35 === errors) {
                                              if (
                                                data13.input_tokens !==
                                                undefined
                                              ) {
                                                let data14 =
                                                  data13.input_tokens;
                                                const _errs36 = errors;
                                                if (!(
                                                  typeof data14 == "number" &&
                                                  !(data14 % 1) &&
                                                  !isNaN(data14)
                                                )) {
                                                  validate25.errors = [
                                                    {
                                                      instancePath:
                                                        instancePath +
                                                        "/usage/input_tokens",
                                                      schemaPath:
                                                        "#/$defs/Usage/properties/input_tokens/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "integer",
                                                      },
                                                      message:
                                                        "must be integer",
                                                    },
                                                  ];
                                                  return false;
                                                }
                                                if (errors === _errs36) {
                                                  if (
                                                    typeof data14 == "number"
                                                  ) {
                                                    if (
                                                      data14 < 0 ||
                                                      isNaN(data14)
                                                    ) {
                                                      validate25.errors = [
                                                        {
                                                          instancePath:
                                                            instancePath +
                                                            "/usage/input_tokens",
                                                          schemaPath:
                                                            "#/$defs/Usage/properties/input_tokens/minimum",
                                                          keyword: "minimum",
                                                          params: {
                                                            comparison: ">=",
                                                            limit: 0,
                                                          },
                                                          message:
                                                            "must be >= 0",
                                                        },
                                                      ];
                                                      return false;
                                                    }
                                                  }
                                                }
                                                var valid3 = _errs36 === errors;
                                              } else {
                                                var valid3 = true;
                                              }
                                              if (valid3) {
                                                if (
                                                  data13.output_tokens !==
                                                  undefined
                                                ) {
                                                  let data15 =
                                                    data13.output_tokens;
                                                  const _errs38 = errors;
                                                  if (!(
                                                    typeof data15 == "number" &&
                                                    !(data15 % 1) &&
                                                    !isNaN(data15)
                                                  )) {
                                                    validate25.errors = [
                                                      {
                                                        instancePath:
                                                          instancePath +
                                                          "/usage/output_tokens",
                                                        schemaPath:
                                                          "#/$defs/Usage/properties/output_tokens/type",
                                                        keyword: "type",
                                                        params: {
                                                          type: "integer",
                                                        },
                                                        message:
                                                          "must be integer",
                                                      },
                                                    ];
                                                    return false;
                                                  }
                                                  if (errors === _errs38) {
                                                    if (
                                                      typeof data15 == "number"
                                                    ) {
                                                      if (
                                                        data15 < 0 ||
                                                        isNaN(data15)
                                                      ) {
                                                        validate25.errors = [
                                                          {
                                                            instancePath:
                                                              instancePath +
                                                              "/usage/output_tokens",
                                                            schemaPath:
                                                              "#/$defs/Usage/properties/output_tokens/minimum",
                                                            keyword: "minimum",
                                                            params: {
                                                              comparison: ">=",
                                                              limit: 0,
                                                            },
                                                            message:
                                                              "must be >= 0",
                                                          },
                                                        ];
                                                        return false;
                                                      }
                                                    }
                                                  }
                                                  var valid3 =
                                                    _errs38 === errors;
                                                } else {
                                                  var valid3 = true;
                                                }
                                              }
                                            }
                                          }
                                        } else {
                                          validate25.errors = [
                                            {
                                              instancePath:
                                                instancePath + "/usage",
                                              schemaPath: "#/$defs/Usage/type",
                                              keyword: "type",
                                              params: { type: "object" },
                                              message: "must be object",
                                            },
                                          ];
                                          return false;
                                        }
                                      }
                                      var valid0 = _errs32 === errors;
                                    } else {
                                      var valid0 = true;
                                    }
                                    if (valid0) {
                                      if (
                                        data.estimated_cost_usd !== undefined
                                      ) {
                                        let data16 = data.estimated_cost_usd;
                                        const _errs40 = errors;
                                        if (errors === _errs40) {
                                          if (typeof data16 == "number") {
                                            if (data16 < 0 || isNaN(data16)) {
                                              validate25.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/estimated_cost_usd",
                                                  schemaPath:
                                                    "#/properties/estimated_cost_usd/minimum",
                                                  keyword: "minimum",
                                                  params: {
                                                    comparison: ">=",
                                                    limit: 0,
                                                  },
                                                  message: "must be >= 0",
                                                },
                                              ];
                                              return false;
                                            }
                                          } else {
                                            validate25.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/estimated_cost_usd",
                                                schemaPath:
                                                  "#/properties/estimated_cost_usd/type",
                                                keyword: "type",
                                                params: { type: "number" },
                                                message: "must be number",
                                              },
                                            ];
                                            return false;
                                          }
                                        }
                                        var valid0 = _errs40 === errors;
                                      } else {
                                        var valid0 = true;
                                      }
                                      if (valid0) {
                                        if (
                                          data.reserved_cost_usd !== undefined
                                        ) {
                                          let data17 = data.reserved_cost_usd;
                                          const _errs42 = errors;
                                          if (errors === _errs42) {
                                            if (typeof data17 == "number") {
                                              if (data17 < 0 || isNaN(data17)) {
                                                validate25.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath +
                                                      "/reserved_cost_usd",
                                                    schemaPath:
                                                      "#/properties/reserved_cost_usd/minimum",
                                                    keyword: "minimum",
                                                    params: {
                                                      comparison: ">=",
                                                      limit: 0,
                                                    },
                                                    message: "must be >= 0",
                                                  },
                                                ];
                                                return false;
                                              }
                                            } else {
                                              validate25.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/reserved_cost_usd",
                                                  schemaPath:
                                                    "#/properties/reserved_cost_usd/type",
                                                  keyword: "type",
                                                  params: { type: "number" },
                                                  message: "must be number",
                                                },
                                              ];
                                              return false;
                                            }
                                          }
                                          var valid0 = _errs42 === errors;
                                        } else {
                                          var valid0 = true;
                                        }
                                        if (valid0) {
                                          if (
                                            data.usage_complete !== undefined
                                          ) {
                                            const _errs44 = errors;
                                            if (
                                              typeof data.usage_complete !==
                                              "boolean"
                                            ) {
                                              validate25.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/usage_complete",
                                                  schemaPath:
                                                    "#/properties/usage_complete/type",
                                                  keyword: "type",
                                                  params: { type: "boolean" },
                                                  message: "must be boolean",
                                                },
                                              ];
                                              return false;
                                            }
                                            var valid0 = _errs44 === errors;
                                          } else {
                                            var valid0 = true;
                                          }
                                          if (valid0) {
                                            if (data.settings !== undefined) {
                                              let data19 = data.settings;
                                              const _errs46 = errors;
                                              if (errors === _errs46) {
                                                if (
                                                  data19 &&
                                                  typeof data19 == "object" &&
                                                  !Array.isArray(data19)
                                                ) {
                                                } else {
                                                  validate25.errors = [
                                                    {
                                                      instancePath:
                                                        instancePath +
                                                        "/settings",
                                                      schemaPath:
                                                        "#/properties/settings/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "object",
                                                      },
                                                      message: "must be object",
                                                    },
                                                  ];
                                                  return false;
                                                }
                                              }
                                              var valid0 = _errs46 === errors;
                                            } else {
                                              var valid0 = true;
                                            }
                                            if (valid0) {
                                              if (data.grade !== undefined) {
                                                let data20 = data.grade;
                                                const _errs49 = errors;
                                                const _errs50 = errors;
                                                if (errors === _errs50) {
                                                  if (
                                                    data20 &&
                                                    typeof data20 == "object" &&
                                                    !Array.isArray(data20)
                                                  ) {
                                                    let missing2;
                                                    if (
                                                      (data20.success ===
                                                        undefined &&
                                                        (missing2 =
                                                          "success")) ||
                                                      (data20.completed_requests ===
                                                        undefined &&
                                                        (missing2 =
                                                          "completed_requests")) ||
                                                      (data20.total_requests ===
                                                        undefined &&
                                                        (missing2 =
                                                          "total_requests")) ||
                                                      (data20.violations ===
                                                        undefined &&
                                                        (missing2 =
                                                          "violations"))
                                                    ) {
                                                      validate25.errors = [
                                                        {
                                                          instancePath:
                                                            instancePath +
                                                            "/grade",
                                                          schemaPath:
                                                            "#/$defs/Grade/required",
                                                          keyword: "required",
                                                          params: {
                                                            missingProperty:
                                                              missing2,
                                                          },
                                                          message:
                                                            "must have required property '" +
                                                            missing2 +
                                                            "'",
                                                        },
                                                      ];
                                                      return false;
                                                    } else {
                                                      const _errs52 = errors;
                                                      for (const key2 in data20) {
                                                        if (!(
                                                          key2 === "success" ||
                                                          key2 ===
                                                            "completed_requests" ||
                                                          key2 ===
                                                            "total_requests" ||
                                                          key2 === "violations"
                                                        )) {
                                                          validate25.errors = [
                                                            {
                                                              instancePath:
                                                                instancePath +
                                                                "/grade",
                                                              schemaPath:
                                                                "#/$defs/Grade/additionalProperties",
                                                              keyword:
                                                                "additionalProperties",
                                                              params: {
                                                                additionalProperty:
                                                                  key2,
                                                              },
                                                              message:
                                                                "must NOT have additional properties",
                                                            },
                                                          ];
                                                          return false;
                                                          break;
                                                        }
                                                      }
                                                      if (_errs52 === errors) {
                                                        if (
                                                          data20.success !==
                                                          undefined
                                                        ) {
                                                          const _errs53 =
                                                            errors;
                                                          if (
                                                            typeof data20.success !==
                                                            "boolean"
                                                          ) {
                                                            validate25.errors =
                                                              [
                                                                {
                                                                  instancePath:
                                                                    instancePath +
                                                                    "/grade/success",
                                                                  schemaPath:
                                                                    "#/$defs/Grade/properties/success/type",
                                                                  keyword:
                                                                    "type",
                                                                  params: {
                                                                    type: "boolean",
                                                                  },
                                                                  message:
                                                                    "must be boolean",
                                                                },
                                                              ];
                                                            return false;
                                                          }
                                                          var valid5 =
                                                            _errs53 === errors;
                                                        } else {
                                                          var valid5 = true;
                                                        }
                                                        if (valid5) {
                                                          if (
                                                            data20.completed_requests !==
                                                            undefined
                                                          ) {
                                                            let data22 =
                                                              data20.completed_requests;
                                                            const _errs55 =
                                                              errors;
                                                            if (!(
                                                              typeof data22 ==
                                                                "number" &&
                                                              !(data22 % 1) &&
                                                              !isNaN(data22)
                                                            )) {
                                                              validate25.errors =
                                                                [
                                                                  {
                                                                    instancePath:
                                                                      instancePath +
                                                                      "/grade/completed_requests",
                                                                    schemaPath:
                                                                      "#/$defs/Grade/properties/completed_requests/type",
                                                                    keyword:
                                                                      "type",
                                                                    params: {
                                                                      type: "integer",
                                                                    },
                                                                    message:
                                                                      "must be integer",
                                                                  },
                                                                ];
                                                              return false;
                                                            }
                                                            var valid5 =
                                                              _errs55 ===
                                                              errors;
                                                          } else {
                                                            var valid5 = true;
                                                          }
                                                          if (valid5) {
                                                            if (
                                                              data20.total_requests !==
                                                              undefined
                                                            ) {
                                                              let data23 =
                                                                data20.total_requests;
                                                              const _errs57 =
                                                                errors;
                                                              if (!(
                                                                typeof data23 ==
                                                                  "number" &&
                                                                !(data23 % 1) &&
                                                                !isNaN(data23)
                                                              )) {
                                                                validate25.errors =
                                                                  [
                                                                    {
                                                                      instancePath:
                                                                        instancePath +
                                                                        "/grade/total_requests",
                                                                      schemaPath:
                                                                        "#/$defs/Grade/properties/total_requests/type",
                                                                      keyword:
                                                                        "type",
                                                                      params: {
                                                                        type: "integer",
                                                                      },
                                                                      message:
                                                                        "must be integer",
                                                                    },
                                                                  ];
                                                                return false;
                                                              }
                                                              var valid5 =
                                                                _errs57 ===
                                                                errors;
                                                            } else {
                                                              var valid5 = true;
                                                            }
                                                            if (valid5) {
                                                              if (
                                                                data20.violations !==
                                                                undefined
                                                              ) {
                                                                let data24 =
                                                                  data20.violations;
                                                                const _errs59 =
                                                                  errors;
                                                                if (
                                                                  errors ===
                                                                  _errs59
                                                                ) {
                                                                  if (
                                                                    Array.isArray(
                                                                      data24,
                                                                    )
                                                                  ) {
                                                                    var valid6 = true;
                                                                    const len0 =
                                                                      data24.length;
                                                                    for (
                                                                      let i0 = 0;
                                                                      i0 < len0;
                                                                      i0++
                                                                    ) {
                                                                      const _errs61 =
                                                                        errors;
                                                                      if (
                                                                        typeof data24[
                                                                          i0
                                                                        ] !==
                                                                        "string"
                                                                      ) {
                                                                        validate25.errors =
                                                                          [
                                                                            {
                                                                              instancePath:
                                                                                instancePath +
                                                                                "/grade/violations/" +
                                                                                i0,
                                                                              schemaPath:
                                                                                "#/$defs/Grade/properties/violations/items/type",
                                                                              keyword:
                                                                                "type",
                                                                              params:
                                                                                {
                                                                                  type: "string",
                                                                                },
                                                                              message:
                                                                                "must be string",
                                                                            },
                                                                          ];
                                                                        return false;
                                                                      }
                                                                      var valid6 =
                                                                        _errs61 ===
                                                                        errors;
                                                                      if (
                                                                        !valid6
                                                                      ) {
                                                                        break;
                                                                      }
                                                                    }
                                                                  } else {
                                                                    validate25.errors =
                                                                      [
                                                                        {
                                                                          instancePath:
                                                                            instancePath +
                                                                            "/grade/violations",
                                                                          schemaPath:
                                                                            "#/$defs/Grade/properties/violations/type",
                                                                          keyword:
                                                                            "type",
                                                                          params:
                                                                            {
                                                                              type: "array",
                                                                            },
                                                                          message:
                                                                            "must be array",
                                                                        },
                                                                      ];
                                                                    return false;
                                                                  }
                                                                }
                                                                var valid5 =
                                                                  _errs59 ===
                                                                  errors;
                                                              } else {
                                                                var valid5 = true;
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  } else {
                                                    validate25.errors = [
                                                      {
                                                        instancePath:
                                                          instancePath +
                                                          "/grade",
                                                        schemaPath:
                                                          "#/$defs/Grade/type",
                                                        keyword: "type",
                                                        params: {
                                                          type: "object",
                                                        },
                                                        message:
                                                          "must be object",
                                                      },
                                                    ];
                                                    return false;
                                                  }
                                                }
                                                var valid0 = _errs49 === errors;
                                              } else {
                                                var valid0 = true;
                                              }
                                              if (valid0) {
                                                if (
                                                  data.final_state !== undefined
                                                ) {
                                                  const _errs63 = errors;
                                                  if (
                                                    !validate22(
                                                      data.final_state,
                                                      {
                                                        instancePath:
                                                          instancePath +
                                                          "/final_state",
                                                        parentData: data,
                                                        parentDataProperty:
                                                          "final_state",
                                                        rootData,
                                                        dynamicAnchors,
                                                      },
                                                    )
                                                  ) {
                                                    vErrors =
                                                      vErrors === null
                                                        ? validate22.errors
                                                        : vErrors.concat(
                                                            validate22.errors,
                                                          );
                                                    errors = vErrors.length;
                                                  }
                                                  var valid0 =
                                                    _errs63 === errors;
                                                } else {
                                                  var valid0 = true;
                                                }
                                                if (valid0) {
                                                  if (
                                                    data.events !== undefined
                                                  ) {
                                                    let data27 = data.events;
                                                    const _errs64 = errors;
                                                    if (errors === _errs64) {
                                                      if (
                                                        Array.isArray(data27)
                                                      ) {
                                                        var valid7 = true;
                                                        const len1 =
                                                          data27.length;
                                                        for (
                                                          let i1 = 0;
                                                          i1 < len1;
                                                          i1++
                                                        ) {
                                                          const _errs66 =
                                                            errors;
                                                          if (
                                                            !validate27(
                                                              data27[i1],
                                                              {
                                                                instancePath:
                                                                  instancePath +
                                                                  "/events/" +
                                                                  i1,
                                                                parentData:
                                                                  data27,
                                                                parentDataProperty:
                                                                  i1,
                                                                rootData,
                                                                dynamicAnchors,
                                                              },
                                                            )
                                                          ) {
                                                            vErrors =
                                                              vErrors === null
                                                                ? validate27.errors
                                                                : vErrors.concat(
                                                                    validate27.errors,
                                                                  );
                                                            errors =
                                                              vErrors.length;
                                                          }
                                                          var valid7 =
                                                            _errs66 === errors;
                                                          if (!valid7) {
                                                            break;
                                                          }
                                                        }
                                                      } else {
                                                        validate25.errors = [
                                                          {
                                                            instancePath:
                                                              instancePath +
                                                              "/events",
                                                            schemaPath:
                                                              "#/properties/events/type",
                                                            keyword: "type",
                                                            params: {
                                                              type: "array",
                                                            },
                                                            message:
                                                              "must be array",
                                                          },
                                                        ];
                                                        return false;
                                                      }
                                                    }
                                                    var valid0 =
                                                      _errs64 === errors;
                                                  } else {
                                                    var valid0 = true;
                                                  }
                                                  if (valid0) {
                                                    if (
                                                      data.assessment !==
                                                      undefined
                                                    ) {
                                                      let data29 =
                                                        data.assessment;
                                                      const _errs67 = errors;
                                                      const _errs68 = errors;
                                                      let valid8 = false;
                                                      const _errs69 = errors;
                                                      if (
                                                        !validate30(data29, {
                                                          instancePath:
                                                            instancePath +
                                                            "/assessment",
                                                          parentData: data,
                                                          parentDataProperty:
                                                            "assessment",
                                                          rootData,
                                                          dynamicAnchors,
                                                        })
                                                      ) {
                                                        vErrors =
                                                          vErrors === null
                                                            ? validate30.errors
                                                            : vErrors.concat(
                                                                validate30.errors,
                                                              );
                                                        errors = vErrors.length;
                                                      }
                                                      var _valid1 =
                                                        _errs69 === errors;
                                                      valid8 =
                                                        valid8 || _valid1;
                                                      const _errs70 = errors;
                                                      if (data29 !== null) {
                                                        const err3 = {
                                                          instancePath:
                                                            instancePath +
                                                            "/assessment",
                                                          schemaPath:
                                                            "#/properties/assessment/anyOf/1/type",
                                                          keyword: "type",
                                                          params: {
                                                            type: "null",
                                                          },
                                                          message:
                                                            "must be null",
                                                        };
                                                        if (vErrors === null) {
                                                          vErrors = [err3];
                                                        } else {
                                                          vErrors.push(err3);
                                                        }
                                                        errors++;
                                                      }
                                                      var _valid1 =
                                                        _errs70 === errors;
                                                      valid8 =
                                                        valid8 || _valid1;
                                                      if (!valid8) {
                                                        const err4 = {
                                                          instancePath:
                                                            instancePath +
                                                            "/assessment",
                                                          schemaPath:
                                                            "#/properties/assessment/anyOf",
                                                          keyword: "anyOf",
                                                          params: {},
                                                          message:
                                                            "must match a schema in anyOf",
                                                        };
                                                        if (vErrors === null) {
                                                          vErrors = [err4];
                                                        } else {
                                                          vErrors.push(err4);
                                                        }
                                                        errors++;
                                                        validate25.errors =
                                                          vErrors;
                                                        return false;
                                                      } else {
                                                        errors = _errs68;
                                                        if (vErrors !== null) {
                                                          if (_errs68) {
                                                            vErrors.length =
                                                              _errs68;
                                                          } else {
                                                            vErrors = null;
                                                          }
                                                        }
                                                      }
                                                      var valid0 =
                                                        _errs67 === errors;
                                                    } else {
                                                      var valid0 = true;
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate25.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate25.errors = vErrors;
  return errors === 0;
}
validate25.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
function validate20(
  data,
  {
    instancePath = "",
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.schema_version === undefined && (missing0 = "schema_version")) ||
        (data.experiment_id === undefined && (missing0 = "experiment_id")) ||
        (data.created_at === undefined && (missing0 = "created_at")) ||
        (data.code_revision === undefined && (missing0 = "code_revision")) ||
        (data.prompt_version === undefined && (missing0 = "prompt_version")) ||
        (data.config === undefined && (missing0 = "config")) ||
        (data.scenarios === undefined && (missing0 = "scenarios")) ||
        (data.trials === undefined && (missing0 = "trials"))
      ) {
        validate20.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(
            key0 === "schema_version" ||
            key0 === "experiment_id" ||
            key0 === "created_at" ||
            key0 === "code_revision" ||
            key0 === "prompt_version" ||
            key0 === "config" ||
            key0 === "scenarios" ||
            key0 === "trials"
          )) {
            validate20.errors = [
              {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: key0 },
                message: "must NOT have additional properties",
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.schema_version !== undefined) {
            let data0 = data.schema_version;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate20.errors = [
                {
                  instancePath: instancePath + "/schema_version",
                  schemaPath: "#/properties/schema_version/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                },
              ];
              return false;
            }
            if (!(data0 === "2.0" || data0 === "3.0")) {
              validate20.errors = [
                {
                  instancePath: instancePath + "/schema_version",
                  schemaPath: "#/properties/schema_version/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema31.properties.schema_version.enum,
                  },
                  message: "must be equal to one of the allowed values",
                },
              ];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.experiment_id !== undefined) {
              const _errs4 = errors;
              if (typeof data.experiment_id !== "string") {
                validate20.errors = [
                  {
                    instancePath: instancePath + "/experiment_id",
                    schemaPath: "#/properties/experiment_id/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string",
                  },
                ];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.created_at !== undefined) {
                const _errs6 = errors;
                if (typeof data.created_at !== "string") {
                  validate20.errors = [
                    {
                      instancePath: instancePath + "/created_at",
                      schemaPath: "#/properties/created_at/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string",
                    },
                  ];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.code_revision !== undefined) {
                  const _errs8 = errors;
                  if (typeof data.code_revision !== "string") {
                    validate20.errors = [
                      {
                        instancePath: instancePath + "/code_revision",
                        schemaPath: "#/properties/code_revision/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string",
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.prompt_version !== undefined) {
                    let data4 = data.prompt_version;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate20.errors = [
                        {
                          instancePath: instancePath + "/prompt_version",
                          schemaPath: "#/properties/prompt_version/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        },
                      ];
                      return false;
                    }
                    if (!(data4 === "2.0" || data4 === "3.0")) {
                      validate20.errors = [
                        {
                          instancePath: instancePath + "/prompt_version",
                          schemaPath: "#/properties/prompt_version/enum",
                          keyword: "enum",
                          params: {
                            allowedValues:
                              schema31.properties.prompt_version.enum,
                          },
                          message: "must be equal to one of the allowed values",
                        },
                      ];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.config !== undefined) {
                      let data5 = data.config;
                      const _errs12 = errors;
                      const _errs13 = errors;
                      if (errors === _errs13) {
                        if (
                          data5 &&
                          typeof data5 == "object" &&
                          !Array.isArray(data5)
                        ) {
                          let missing1;
                          if (
                            (data5.budget_usd === undefined &&
                              (missing1 = "budget_usd")) ||
                            (data5.max_turns === undefined &&
                              (missing1 = "max_turns")) ||
                            (data5.max_tool_calls === undefined &&
                              (missing1 = "max_tool_calls")) ||
                            (data5.max_output_tokens === undefined &&
                              (missing1 = "max_output_tokens")) ||
                            (data5.max_input_tokens === undefined &&
                              (missing1 = "max_input_tokens")) ||
                            (data5.repetitions === undefined &&
                              (missing1 = "repetitions"))
                          ) {
                            validate20.errors = [
                              {
                                instancePath: instancePath + "/config",
                                schemaPath: "#/$defs/ExperimentConfig/required",
                                keyword: "required",
                                params: { missingProperty: missing1 },
                                message:
                                  "must have required property '" +
                                  missing1 +
                                  "'",
                              },
                            ];
                            return false;
                          } else {
                            const _errs15 = errors;
                            for (const key1 in data5) {
                              if (!(
                                key1 === "budget_usd" ||
                                key1 === "max_turns" ||
                                key1 === "max_tool_calls" ||
                                key1 === "max_output_tokens" ||
                                key1 === "max_input_tokens" ||
                                key1 === "repetitions"
                              )) {
                                validate20.errors = [
                                  {
                                    instancePath: instancePath + "/config",
                                    schemaPath:
                                      "#/$defs/ExperimentConfig/additionalProperties",
                                    keyword: "additionalProperties",
                                    params: { additionalProperty: key1 },
                                    message:
                                      "must NOT have additional properties",
                                  },
                                ];
                                return false;
                                break;
                              }
                            }
                            if (_errs15 === errors) {
                              if (data5.budget_usd !== undefined) {
                                let data6 = data5.budget_usd;
                                const _errs16 = errors;
                                if (errors === _errs16) {
                                  if (typeof data6 == "number") {
                                    if (data6 > 1 || isNaN(data6)) {
                                      validate20.errors = [
                                        {
                                          instancePath:
                                            instancePath + "/config/budget_usd",
                                          schemaPath:
                                            "#/$defs/ExperimentConfig/properties/budget_usd/maximum",
                                          keyword: "maximum",
                                          params: {
                                            comparison: "<=",
                                            limit: 1,
                                          },
                                          message: "must be <= 1",
                                        },
                                      ];
                                      return false;
                                    } else {
                                      if (data6 <= 0 || isNaN(data6)) {
                                        validate20.errors = [
                                          {
                                            instancePath:
                                              instancePath +
                                              "/config/budget_usd",
                                            schemaPath:
                                              "#/$defs/ExperimentConfig/properties/budget_usd/exclusiveMinimum",
                                            keyword: "exclusiveMinimum",
                                            params: {
                                              comparison: ">",
                                              limit: 0,
                                            },
                                            message: "must be > 0",
                                          },
                                        ];
                                        return false;
                                      }
                                    }
                                  } else {
                                    validate20.errors = [
                                      {
                                        instancePath:
                                          instancePath + "/config/budget_usd",
                                        schemaPath:
                                          "#/$defs/ExperimentConfig/properties/budget_usd/type",
                                        keyword: "type",
                                        params: { type: "number" },
                                        message: "must be number",
                                      },
                                    ];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data5.max_turns !== undefined) {
                                  let data7 = data5.max_turns;
                                  const _errs18 = errors;
                                  if (!(
                                    typeof data7 == "number" &&
                                    !(data7 % 1) &&
                                    !isNaN(data7)
                                  )) {
                                    validate20.errors = [
                                      {
                                        instancePath:
                                          instancePath + "/config/max_turns",
                                        schemaPath:
                                          "#/$defs/ExperimentConfig/properties/max_turns/type",
                                        keyword: "type",
                                        params: { type: "integer" },
                                        message: "must be integer",
                                      },
                                    ];
                                    return false;
                                  }
                                  if (errors === _errs18) {
                                    if (typeof data7 == "number") {
                                      if (data7 > 8 || isNaN(data7)) {
                                        validate20.errors = [
                                          {
                                            instancePath:
                                              instancePath +
                                              "/config/max_turns",
                                            schemaPath:
                                              "#/$defs/ExperimentConfig/properties/max_turns/maximum",
                                            keyword: "maximum",
                                            params: {
                                              comparison: "<=",
                                              limit: 8,
                                            },
                                            message: "must be <= 8",
                                          },
                                        ];
                                        return false;
                                      } else {
                                        if (data7 < 1 || isNaN(data7)) {
                                          validate20.errors = [
                                            {
                                              instancePath:
                                                instancePath +
                                                "/config/max_turns",
                                              schemaPath:
                                                "#/$defs/ExperimentConfig/properties/max_turns/minimum",
                                              keyword: "minimum",
                                              params: {
                                                comparison: ">=",
                                                limit: 1,
                                              },
                                              message: "must be >= 1",
                                            },
                                          ];
                                          return false;
                                        }
                                      }
                                    }
                                  }
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data5.max_tool_calls !== undefined) {
                                    let data8 = data5.max_tool_calls;
                                    const _errs20 = errors;
                                    if (!(
                                      typeof data8 == "number" &&
                                      !(data8 % 1) &&
                                      !isNaN(data8)
                                    )) {
                                      validate20.errors = [
                                        {
                                          instancePath:
                                            instancePath +
                                            "/config/max_tool_calls",
                                          schemaPath:
                                            "#/$defs/ExperimentConfig/properties/max_tool_calls/type",
                                          keyword: "type",
                                          params: { type: "integer" },
                                          message: "must be integer",
                                        },
                                      ];
                                      return false;
                                    }
                                    if (errors === _errs20) {
                                      if (typeof data8 == "number") {
                                        if (data8 > 12 || isNaN(data8)) {
                                          validate20.errors = [
                                            {
                                              instancePath:
                                                instancePath +
                                                "/config/max_tool_calls",
                                              schemaPath:
                                                "#/$defs/ExperimentConfig/properties/max_tool_calls/maximum",
                                              keyword: "maximum",
                                              params: {
                                                comparison: "<=",
                                                limit: 12,
                                              },
                                              message: "must be <= 12",
                                            },
                                          ];
                                          return false;
                                        } else {
                                          if (data8 < 1 || isNaN(data8)) {
                                            validate20.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/config/max_tool_calls",
                                                schemaPath:
                                                  "#/$defs/ExperimentConfig/properties/max_tool_calls/minimum",
                                                keyword: "minimum",
                                                params: {
                                                  comparison: ">=",
                                                  limit: 1,
                                                },
                                                message: "must be >= 1",
                                              },
                                            ];
                                            return false;
                                          }
                                        }
                                      }
                                    }
                                    var valid2 = _errs20 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                  if (valid2) {
                                    if (data5.max_output_tokens !== undefined) {
                                      let data9 = data5.max_output_tokens;
                                      const _errs22 = errors;
                                      if (!(
                                        typeof data9 == "number" &&
                                        !(data9 % 1) &&
                                        !isNaN(data9)
                                      )) {
                                        validate20.errors = [
                                          {
                                            instancePath:
                                              instancePath +
                                              "/config/max_output_tokens",
                                            schemaPath:
                                              "#/$defs/ExperimentConfig/properties/max_output_tokens/type",
                                            keyword: "type",
                                            params: { type: "integer" },
                                            message: "must be integer",
                                          },
                                        ];
                                        return false;
                                      }
                                      if (errors === _errs22) {
                                        if (typeof data9 == "number") {
                                          if (data9 > 512 || isNaN(data9)) {
                                            validate20.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/config/max_output_tokens",
                                                schemaPath:
                                                  "#/$defs/ExperimentConfig/properties/max_output_tokens/maximum",
                                                keyword: "maximum",
                                                params: {
                                                  comparison: "<=",
                                                  limit: 512,
                                                },
                                                message: "must be <= 512",
                                              },
                                            ];
                                            return false;
                                          } else {
                                            if (data9 < 1 || isNaN(data9)) {
                                              validate20.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/config/max_output_tokens",
                                                  schemaPath:
                                                    "#/$defs/ExperimentConfig/properties/max_output_tokens/minimum",
                                                  keyword: "minimum",
                                                  params: {
                                                    comparison: ">=",
                                                    limit: 1,
                                                  },
                                                  message: "must be >= 1",
                                                },
                                              ];
                                              return false;
                                            }
                                          }
                                        }
                                      }
                                      var valid2 = _errs22 === errors;
                                    } else {
                                      var valid2 = true;
                                    }
                                    if (valid2) {
                                      if (
                                        data5.max_input_tokens !== undefined
                                      ) {
                                        let data10 = data5.max_input_tokens;
                                        const _errs24 = errors;
                                        if (!(
                                          typeof data10 == "number" &&
                                          !(data10 % 1) &&
                                          !isNaN(data10)
                                        )) {
                                          validate20.errors = [
                                            {
                                              instancePath:
                                                instancePath +
                                                "/config/max_input_tokens",
                                              schemaPath:
                                                "#/$defs/ExperimentConfig/properties/max_input_tokens/type",
                                              keyword: "type",
                                              params: { type: "integer" },
                                              message: "must be integer",
                                            },
                                          ];
                                          return false;
                                        }
                                        if (errors === _errs24) {
                                          if (typeof data10 == "number") {
                                            if (
                                              data10 > 6000 ||
                                              isNaN(data10)
                                            ) {
                                              validate20.errors = [
                                                {
                                                  instancePath:
                                                    instancePath +
                                                    "/config/max_input_tokens",
                                                  schemaPath:
                                                    "#/$defs/ExperimentConfig/properties/max_input_tokens/maximum",
                                                  keyword: "maximum",
                                                  params: {
                                                    comparison: "<=",
                                                    limit: 6000,
                                                  },
                                                  message: "must be <= 6000",
                                                },
                                              ];
                                              return false;
                                            } else {
                                              if (data10 < 1 || isNaN(data10)) {
                                                validate20.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath +
                                                      "/config/max_input_tokens",
                                                    schemaPath:
                                                      "#/$defs/ExperimentConfig/properties/max_input_tokens/minimum",
                                                    keyword: "minimum",
                                                    params: {
                                                      comparison: ">=",
                                                      limit: 1,
                                                    },
                                                    message: "must be >= 1",
                                                  },
                                                ];
                                                return false;
                                              }
                                            }
                                          }
                                        }
                                        var valid2 = _errs24 === errors;
                                      } else {
                                        var valid2 = true;
                                      }
                                      if (valid2) {
                                        if (data5.repetitions !== undefined) {
                                          let data11 = data5.repetitions;
                                          const _errs26 = errors;
                                          if (!(
                                            typeof data11 == "number" &&
                                            !(data11 % 1) &&
                                            !isNaN(data11)
                                          )) {
                                            validate20.errors = [
                                              {
                                                instancePath:
                                                  instancePath +
                                                  "/config/repetitions",
                                                schemaPath:
                                                  "#/$defs/ExperimentConfig/properties/repetitions/type",
                                                keyword: "type",
                                                params: { type: "integer" },
                                                message: "must be integer",
                                              },
                                            ];
                                            return false;
                                          }
                                          if (errors === _errs26) {
                                            if (typeof data11 == "number") {
                                              if (
                                                data11 > 10 ||
                                                isNaN(data11)
                                              ) {
                                                validate20.errors = [
                                                  {
                                                    instancePath:
                                                      instancePath +
                                                      "/config/repetitions",
                                                    schemaPath:
                                                      "#/$defs/ExperimentConfig/properties/repetitions/maximum",
                                                    keyword: "maximum",
                                                    params: {
                                                      comparison: "<=",
                                                      limit: 10,
                                                    },
                                                    message: "must be <= 10",
                                                  },
                                                ];
                                                return false;
                                              } else {
                                                if (
                                                  data11 < 1 ||
                                                  isNaN(data11)
                                                ) {
                                                  validate20.errors = [
                                                    {
                                                      instancePath:
                                                        instancePath +
                                                        "/config/repetitions",
                                                      schemaPath:
                                                        "#/$defs/ExperimentConfig/properties/repetitions/minimum",
                                                      keyword: "minimum",
                                                      params: {
                                                        comparison: ">=",
                                                        limit: 1,
                                                      },
                                                      message: "must be >= 1",
                                                    },
                                                  ];
                                                  return false;
                                                }
                                              }
                                            }
                                          }
                                          var valid2 = _errs26 === errors;
                                        } else {
                                          var valid2 = true;
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          validate20.errors = [
                            {
                              instancePath: instancePath + "/config",
                              schemaPath: "#/$defs/ExperimentConfig/type",
                              keyword: "type",
                              params: { type: "object" },
                              message: "must be object",
                            },
                          ];
                          return false;
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.scenarios !== undefined) {
                        let data12 = data.scenarios;
                        const _errs28 = errors;
                        if (errors === _errs28) {
                          if (Array.isArray(data12)) {
                            var valid3 = true;
                            const len0 = data12.length;
                            for (let i0 = 0; i0 < len0; i0++) {
                              const _errs30 = errors;
                              if (
                                !validate21(data12[i0], {
                                  instancePath:
                                    instancePath + "/scenarios/" + i0,
                                  parentData: data12,
                                  parentDataProperty: i0,
                                  rootData,
                                  dynamicAnchors,
                                })
                              ) {
                                vErrors =
                                  vErrors === null
                                    ? validate21.errors
                                    : vErrors.concat(validate21.errors);
                                errors = vErrors.length;
                              }
                              var valid3 = _errs30 === errors;
                              if (!valid3) {
                                break;
                              }
                            }
                          } else {
                            validate20.errors = [
                              {
                                instancePath: instancePath + "/scenarios",
                                schemaPath: "#/properties/scenarios/type",
                                keyword: "type",
                                params: { type: "array" },
                                message: "must be array",
                              },
                            ];
                            return false;
                          }
                        }
                        var valid0 = _errs28 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.trials !== undefined) {
                          let data14 = data.trials;
                          const _errs31 = errors;
                          if (errors === _errs31) {
                            if (Array.isArray(data14)) {
                              var valid4 = true;
                              const len1 = data14.length;
                              for (let i1 = 0; i1 < len1; i1++) {
                                const _errs33 = errors;
                                if (
                                  !validate25(data14[i1], {
                                    instancePath:
                                      instancePath + "/trials/" + i1,
                                    parentData: data14,
                                    parentDataProperty: i1,
                                    rootData,
                                    dynamicAnchors,
                                  })
                                ) {
                                  vErrors =
                                    vErrors === null
                                      ? validate25.errors
                                      : vErrors.concat(validate25.errors);
                                  errors = vErrors.length;
                                }
                                var valid4 = _errs33 === errors;
                                if (!valid4) {
                                  break;
                                }
                              }
                            } else {
                              validate20.errors = [
                                {
                                  instancePath: instancePath + "/trials",
                                  schemaPath: "#/properties/trials/type",
                                  keyword: "type",
                                  params: { type: "array" },
                                  message: "must be array",
                                },
                              ];
                              return false;
                            }
                          }
                          var valid0 = _errs31 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate20.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = {
  props: true,
  dynamicProps: false,
  dynamicItems: false,
};
