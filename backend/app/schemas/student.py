"""Student profile schemas."""

from datetime import date, datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    id: UUID
    user_id: UUID
    name: Optional[str] = None
    father_name: Optional[str] = None
    father_mobile: Optional[str] = None
    mother_name: Optional[str] = None
    mother_mobile: Optional[str] = None
    neet_roll_no: Optional[str] = None
    neet_rank: Optional[int] = None
    neet_marks: Optional[str] = None
    application_no: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    neet_mobile: Optional[str] = None
    whatsapp_no: Optional[str] = None
    email: Optional[str] = None
    permanent_address: Dict[str, str] = Field(default_factory=dict)
    correspondence_address: Dict[str, str] = Field(default_factory=dict)
    bms_counselling_opted: bool = False
    bhs_counselling_opted: bool = False
    max_budget: Optional[str] = None
    minority: bool = False
    minority_type: Optional[str] = None
    nri_quota: bool = False
    special_quotas: List[str] = Field(default_factory=list)
    domicile_state: Optional[str] = None
    single_child: bool = False
    stayed_in_state_since: Optional[str] = None
    tenth_school_details: Dict[str, str] = Field(default_factory=dict)
    twelfth_school_details: Dict[str, str] = Field(default_factory=dict)
    gap_year: bool = False
    neet_category: Optional[str] = None
    mentor_id: Optional[UUID] = None
    documents_verified: bool = False
    updated_at: Optional[datetime] = None
    remarks: Optional[str] = None
    verified_by: Optional[UUID] = None


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    father_name: Optional[str] = None
    father_mobile: Optional[str] = None
    mother_name: Optional[str] = None
    mother_mobile: Optional[str] = None
    neet_roll_no: Optional[str] = None
    neet_rank: Optional[int] = None
    neet_marks: Optional[str] = None
    application_no: Optional[str] = None
    neet_category: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    neet_mobile: Optional[str] = None
    whatsapp_no: Optional[str] = None
    email: Optional[str] = None
    permanent_address: Optional[Dict[str, str]] = None
    correspondence_address: Optional[Dict[str, str]] = None
    bms_counselling_opted: Optional[bool] = None
    bhs_counselling_opted: Optional[bool] = None
    max_budget: Optional[str] = None
    minority: Optional[bool] = None
    minority_type: Optional[str] = None
    nri_quota: Optional[bool] = None
    special_quotas: Optional[List[str]] = None
    domicile_state: Optional[str] = None
    single_child: Optional[bool] = None
    stayed_in_state_since: Optional[str] = None
    tenth_school_details: Optional[Dict[str, str]] = None
    twelfth_school_details: Optional[Dict[str, str]] = None
    gap_year: Optional[bool] = None


class RequiredDocument(BaseModel):
    doc_id: UUID
    doc_code: str
    doc_name: str
    mandatory: bool
    category: str


class DocumentUploadStatus(BaseModel):
    total_required: int
    uploaded: int
    pending: int
    documents: List[Dict[str, str]]


class DocumentType(BaseModel):
    id: UUID
    code: str
    name: str
    category: str
    required_conditions: Dict[str, str]  # Simplified to str for JSON compatibility


__all__ = [
    "StudentProfile",
    "StudentProfileUpdate",
    "RequiredDocument",
    "DocumentUploadStatus",
    "DocumentType",
]
