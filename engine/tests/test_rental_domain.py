from roadtest.contracts import ExperimentConfig
from roadtest.providers.common import SYSTEM_PROMPT, task_prompt
from roadtest.runner import make_bundle
from roadtest.scenarios import catalog
from roadtest.simulator import tool_definitions


def test_rental_tasks_use_everyday_features_and_calendar_dates():
    tasks = catalog()
    assert len(tasks) == 24
    assert tasks[0].requests[0].customer == "Alex"
    assert tasks[0].requests[0].required_feature == "child_seat"
    assert tasks[0].requests[0].allowed_days == ["2026-10-03", "2026-10-15"]
    assert tasks[0].initial_state.cars[0].name == "Blue SUV"


def test_models_receive_rental_prompts_and_tools():
    assert "rental car" in SYSTEM_PROMPT
    assert "Alex" in task_prompt(catalog()[0])
    assert "child seat" in task_prompt(catalog()[0])
    assert {t["name"] for t in tool_definitions()} == {"check_cars", "book_car", "cancel_booking"}
    assert "observator" not in SYSTEM_PROMPT.lower()


def test_domain_change_has_new_artifact_and_prompt_versions():
    bundle = make_bundle(catalog(), [], ExperimentConfig(), "rental-test")
    assert bundle.schema_version == "2.0"
    assert bundle.prompt_version == "2.0"
    assert all(s.version == "2.0" for s in bundle.scenarios)
