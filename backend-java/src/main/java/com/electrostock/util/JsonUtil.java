package com.electrostock.util;

import com.electrostock.model.*;
import java.util.*;

public class JsonUtil {

    public static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    public static String toJson(Product p) {
        if (p == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"sku\":\"%s\",\"categoryId\":\"%s\",\"brand\":\"%s\",\"model\":\"%s\",\"supplierId\":\"%s\",\"stock\":%d,\"minStock\":%d,\"purchasePrice\":%.2f,\"sellingPrice\":%.2f,\"warrantyPeriodMonths\":%d,\"description\":\"%s\",\"imageUrl\":%s,\"createdAt\":\"%s\",\"updatedAt\":\"%s\"}",
            escape(p.getId()), escape(p.getName()), escape(p.getSku()), escape(p.getCategoryId()),
            escape(p.getBrand()), escape(p.getModel()), escape(p.getSupplierId()),
            p.getStock(), p.getMinStock(), p.getPurchasePrice(), p.getSellingPrice(),
            p.getWarrantyPeriodMonths(), escape(p.getDescription()),
            p.getImageUrl() == null ? "null" : "\"" + escape(p.getImageUrl()) + "\"",
            escape(p.getCreatedAt()), escape(p.getUpdatedAt())
        );
    }

    public static String toJson(Category c) {
        if (c == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"description\":\"%s\",\"productCount\":%d}",
            escape(c.getId()), escape(c.getName()), escape(c.getDescription()), c.getProductCount()
        );
    }

    public static String toJson(Supplier s) {
        if (s == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"company\":\"%s\",\"phone\":\"%s\",\"email\":\"%s\",\"address\":\"%s\",\"gstin\":\"%s\",\"status\":\"%s\",\"createdAt\":\"%s\"}",
            escape(s.getId()), escape(s.getName()), escape(s.getCompany()), escape(s.getPhone()),
            escape(s.getEmail()), escape(s.getAddress()), escape(s.getGstin()), escape(s.getStatus()),
            escape(s.getCreatedAt())
        );
    }

    public static String toJson(Transaction t) {
        if (t == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append(String.format("\"id\":\"%s\",", escape(t.getId())));
        sb.append(String.format("\"productId\":\"%s\",", escape(t.getProductId())));
        sb.append(String.format("\"productName\":\"%s\",", escape(t.getProductName())));
        sb.append(String.format("\"type\":\"%s\",", escape(t.getType())));
        sb.append(String.format("\"quantity\":%d,", t.getQuantity()));
        sb.append(String.format("\"unitPrice\":%.2f,", t.getUnitPrice()));
        sb.append(String.format("\"totalValue\":%.2f,", t.getTotalValue()));
        sb.append(String.format("\"purchaseCost\":%.2f,", t.getPurchaseCost()));
        sb.append(String.format("\"profitLoss\":%.2f,", t.getProfitLoss()));
        sb.append(String.format("\"date\":\"%s\",", escape(t.getDate())));
        sb.append(String.format("\"userId\":\"%s\",", escape(t.getUserId())));
        sb.append(String.format("\"userName\":\"%s\",", escape(t.getUserName())));
        sb.append(String.format("\"reference\":\"%s\",", escape(t.getReference())));
        sb.append(String.format("\"customerRef\":\"%s\",", escape(t.getCustomerRef())));
        sb.append(String.format("\"notes\":\"%s\",", escape(t.getNotes())));
        sb.append("\"serialNumbers\":[");
        if (t.getSerialNumbers() != null) {
            for (int i = 0; i < t.getSerialNumbers().size(); i++) {
                sb.append("\"").append(escape(t.getSerialNumbers().get(i))).append("\"");
                if (i < t.getSerialNumbers().size() - 1) sb.append(",");
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String toJson(SerialImei s) {
        if (s == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"productId\":\"%s\",\"productName\":\"%s\",\"serialNumber\":\"%s\",\"imei\":%s,\"status\":\"%s\",\"warrantyId\":%s,\"dateAdded\":\"%s\",\"dateSold\":%s,\"customerRef\":%s}",
            escape(s.getId()), escape(s.getProductId()), escape(s.getProductName()), escape(s.getSerialNumber()),
            s.getImei() == null ? "null" : "\"" + escape(s.getImei()) + "\"",
            escape(s.getStatus()),
            s.getWarrantyId() == null ? "null" : "\"" + escape(s.getWarrantyId()) + "\"",
            escape(s.getDateAdded()),
            s.getDateSold() == null ? "null" : "\"" + escape(s.getDateSold()) + "\"",
            s.getCustomerRef() == null ? "null" : "\"" + escape(s.getCustomerRef()) + "\""
        );
    }

    public static String toJson(WarrantyClaim c) {
        if (c == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"warrantyId\":\"%s\",\"date\":\"%s\",\"issueDescription\":\"%s\",\"status\":\"%s\",\"resolutionNotes\":\"%s\"}",
            escape(c.getId()), escape(c.getWarrantyId()), escape(c.getDate()),
            escape(c.getIssueDescription()), escape(c.getStatus()), escape(c.getResolutionNotes())
        );
    }

    public static String toJson(Warranty w) {
        if (w == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append(String.format("\"id\":\"%s\",", escape(w.getId())));
        sb.append(String.format("\"productId\":\"%s\",", escape(w.getProductId())));
        sb.append(String.format("\"productName\":\"%s\",", escape(w.getProductName())));
        sb.append(String.format("\"serialNumber\":\"%s\",", escape(w.getSerialNumber())));
        sb.append(String.format("\"customerRef\":\"%s\",", escape(w.getCustomerRef())));
        sb.append(String.format("\"customerName\":\"%s\",", escape(w.getCustomerName() != null ? w.getCustomerName() : w.getCustomerRef())));
        sb.append(String.format("\"customerEmail\":\"%s\",", escape(w.getCustomerEmail() != null ? w.getCustomerEmail() : "")));
        sb.append(String.format("\"customerPhone\":\"%s\",", escape(w.getCustomerPhone() != null ? w.getCustomerPhone() : "")));
        sb.append(String.format("\"startDate\":\"%s\",", escape(w.getStartDate())));
        sb.append(String.format("\"endDate\":\"%s\",", escape(w.getEndDate())));
        sb.append(String.format("\"status\":\"%s\",", escape(w.getStatus())));
        sb.append(String.format("\"notes\":\"%s\",", escape(w.getNotes() != null ? w.getNotes() : "")));
        sb.append("\"claims\":[");
        if (w.getClaims() != null) {
            for (int i = 0; i < w.getClaims().size(); i++) {
                sb.append(toJson(w.getClaims().get(i)));
                if (i < w.getClaims().size() - 1) sb.append(",");
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String toJson(PurchaseOrderItem item) {
        if (item == null) return "null";
        return String.format(
            "{\"productId\":\"%s\",\"productName\":\"%s\",\"quantity\":%d,\"receivedQuantity\":%d,\"unitPrice\":%.2f,\"total\":%.2f}",
            escape(item.getProductId()), escape(item.getProductName()), item.getQuantity(),
            item.getReceivedQuantity(), item.getUnitPrice(), item.getTotal()
        );
    }

    public static String toJson(PurchaseOrder po) {
        if (po == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append(String.format("\"id\":\"%s\",", escape(po.getId())));
        sb.append(String.format("\"poNumber\":\"%s\",", escape(po.getPoNumber())));
        sb.append(String.format("\"supplierId\":\"%s\",", escape(po.getSupplierId())));
        sb.append(String.format("\"supplierName\":\"%s\",", escape(po.getSupplierName())));
        sb.append(String.format("\"totalCost\":%.2f,", po.getTotalCost()));
        sb.append(String.format("\"status\":\"%s\",", escape(po.getStatus())));
        sb.append(String.format("\"createdDate\":\"%s\",", escape(po.getCreatedDate())));
        sb.append(String.format("\"expectedDate\":\"%s\",", escape(po.getExpectedDate())));
        sb.append(String.format("\"receivedDate\":%s,", po.getReceivedDate() == null ? "null" : "\"" + escape(po.getReceivedDate()) + "\""));
        sb.append(String.format("\"userId\":\"%s\",", escape(po.getUserId())));
        sb.append(String.format("\"userName\":\"%s\",", escape(po.getUserName())));
        sb.append(String.format("\"notes\":\"%s\",", escape(po.getNotes() != null ? po.getNotes() : "")));
        sb.append("\"items\":[");
        if (po.getItems() != null) {
            for (int i = 0; i < po.getItems().size(); i++) {
                sb.append(toJson(po.getItems().get(i)));
                if (i < po.getItems().size() - 1) sb.append(",");
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String toJson(Alert a) {
        if (a == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"type\":\"%s\",\"severity\":\"%s\",\"title\":\"%s\",\"message\":\"%s\",\"productId\":%s,\"productName\":%s,\"read\":%b,\"resolved\":%b,\"createdAt\":\"%s\"}",
            escape(a.getId()), escape(a.getType()), escape(a.getSeverity()),
            escape(a.getTitle()), escape(a.getMessage()),
            a.getProductId() == null ? "null" : "\"" + escape(a.getProductId()) + "\"",
            a.getProductName() == null ? "null" : "\"" + escape(a.getProductName()) + "\"",
            a.isRead(), a.isResolved(), escape(a.getCreatedAt())
        );
    }

    public static String toJson(User u) {
        if (u == null) return "null";
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"status\":\"%s\",\"lastLogin\":%s,\"createdAt\":\"%s\"}",
            escape(u.getId()), escape(u.getName()), escape(u.getEmail()),
            escape(u.getRole()), escape(u.getStatus()),
            u.getLastLogin() == null ? "null" : "\"" + escape(u.getLastLogin()) + "\"",
            escape(u.getCreatedAt())
        );
    }

    public static String toJson(SystemSettings s) {
        if (s == null) return "null";
        return String.format(
            "{\"storeName\":\"%s\",\"storeEmail\":\"%s\",\"storePhone\":\"%s\",\"storeAddress\":\"%s\",\"currency\":\"%s\",\"currencySymbol\":\"%s\",\"taxRate\":%.2f,\"lowStockThresholdDefault\":%d,\"autoAlertLowStock\":%b,\"autoAlertExpiringWarranty\":%b,\"warrantyExpiryWarningDays\":%d,\"enableSoundAlerts\":%b,\"theme\":\"%s\"}",
            escape(s.getStoreName()), escape(s.getStoreEmail()), escape(s.getStorePhone()),
            escape(s.getStoreAddress()), escape(s.getCurrency()), escape(s.getCurrencySymbol()),
            s.getTaxRate(), s.getLowStockThresholdDefault(), s.isAutoAlertLowStock(),
            s.isAutoAlertExpiringWarranty(), s.getWarrantyExpiryWarningDays(),
            s.isEnableSoundAlerts(), escape(s.getTheme())
        );
    }

    // Parse simple key-value JSON string
    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;

        String cleaned = json.trim();
        if (cleaned.startsWith("{")) cleaned = cleaned.substring(1);
        if (cleaned.endsWith("}")) cleaned = cleaned.substring(0, cleaned.length() - 1);

        // Simple token split
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        List<String> pairs = new ArrayList<>();

        for (int i = 0; i < cleaned.length(); i++) {
            char c = cleaned.charAt(i);
            if (c == '\"' && (i == 0 || cleaned.charAt(i - 1) != '\\')) {
                inQuotes = !inQuotes;
            }
            if (c == ',' && !inQuotes) {
                pairs.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) pairs.add(current.toString());

        for (String pair : pairs) {
            int colon = pair.indexOf(':');
            if (colon != -1) {
                String key = pair.substring(0, colon).trim().replaceAll("^\"|\"$", "");
                String val = pair.substring(colon + 1).trim().replaceAll("^\"|\"$", "");
                map.put(key, val);
            }
        }
        return map;
    }

    public static String mapToJson(Map<String, Object> map) {
        if (map == null) return "{}";
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(escape(e.getKey())).append("\":");
            Object val = e.getValue();
            if (val == null) {
                sb.append("null");
            } else if (val instanceof Number || val instanceof Boolean) {
                sb.append(val.toString());
            } else {
                sb.append("\"").append(escape(val.toString())).append("\"");
            }
        }
        sb.append("}");
        return sb.toString();
    }
}
