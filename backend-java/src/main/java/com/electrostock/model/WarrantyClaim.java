package com.electrostock.model;

public class WarrantyClaim {
    private String id;
    private String warrantyId;
    private String date;
    private String issueDescription;
    private String status;
    private String resolutionNotes;

    public WarrantyClaim() {}

    public WarrantyClaim(String id, String warrantyId, String date, String issueDescription, String status, String resolutionNotes) {
        this.id = id;
        this.warrantyId = warrantyId;
        this.date = date;
        this.issueDescription = issueDescription;
        this.status = status;
        this.resolutionNotes = resolutionNotes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWarrantyId() { return warrantyId; }
    public void setWarrantyId(String warrantyId) { this.warrantyId = warrantyId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
