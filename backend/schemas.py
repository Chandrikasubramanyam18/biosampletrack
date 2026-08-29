from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SampleStatus(str, Enum):
    RECEIVED = "Received"
    QC = "QC"
    LIBRARY_PREP = "Library Prep"
    SEQUENCING = "Sequencing"
    ANALYSIS = "Analysis"
    COMPLETED = "Completed"
    FAILED = "Failed"


class SampleCreate(BaseModel):
    sample_id: str = Field(
        min_length=3,
        max_length=50
    )

    sample_type: str = Field(
        min_length=2,
        max_length=50
    )

    organism: str = Field(
        min_length=2,
        max_length=100
    )

    tissue: str = Field(
        min_length=2,
        max_length=100
    )

    condition: str = Field(
        min_length=2,
        max_length=100
    )

    experiment: str = Field(
        min_length=2,
        max_length=100
    )

    status: SampleStatus

    @field_validator(
        "sample_id",
        "sample_type",
        "organism",
        "tissue",
        "condition",
        "experiment"
    )
    @classmethod
    def validate_text(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty.")

        return value


class SampleResponse(BaseModel):
    id: int
    sample_id: str
    sample_type: str
    organism: str
    tissue: str
    condition: str
    experiment: str
    status: SampleStatus

    model_config = ConfigDict(from_attributes=True)


class SampleStatusUpdate(BaseModel):
    status: SampleStatus