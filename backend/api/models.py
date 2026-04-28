from pydantic import BaseModel
from typing import List, Optional

class EnrollmentRecord(BaseModel):
    country: str
    year: int
    primary_enrollment_rate: Optional[float]
    secondary_enrollment_rate: Optional[float]
    tertiary_enrollment_rate: Optional[float]
    enrollment_drop_off: Optional[float]

class LiteracyRecord(BaseModel):
    country: str
    year: int
    literacy_rate_adult: Optional[float]
    literacy_rate_youth_male: Optional[float]
    literacy_rate_youth_female: Optional[float]
    gender_literacy_gap: Optional[float]

class OutOfSchoolRecord(BaseModel):
    country: str
    year: int
    out_of_school_primary: Optional[float]
    out_of_school_female: Optional[float]
    female_oos_pct: Optional[float]

class CompletionRecord(BaseModel):
    country: str
    year: int
    primary_completion_rate: Optional[float]
    lower_secondary_completion: Optional[float]

class ExpenditureRecord(BaseModel):
    country: str
    year: int
    govt_education_expenditure: Optional[float]

class RankingItem(BaseModel):
    rank: int
    country: str
    value: float

class RankingResponse(BaseModel):
    year: int
    metric: str
    ranking: List[RankingItem]

class CorrelationMatrix(BaseModel):
    variables: List[str]
    matrix: dict

class TrendResponse(BaseModel):
    country: str
    trend: List[dict]
    primary_enrollment_change_pct: Optional[float]
    literacy_change_pct: Optional[float]
    trend_enrollment: Optional[List[float]]
    trend_literacy: Optional[List[float]]
