package com.electrostock.controller;

import com.electrostock.model.SerialImei;
import com.electrostock.model.Transaction;
import com.electrostock.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final DataStore store = DataStore.getInstance();

    @PostMapping("/inventory/stock-in")
    public ResponseEntity<?> stockIn(@RequestBody Map<String, Object> req) {
        String productId = (String) req.get("productId");
        int quantity = ((Number) req.getOrDefault("quantity", 1)).intValue();
        double purchasePrice = ((Number) req.getOrDefault("purchasePrice", 0.0)).doubleValue();
        String ref = (String) req.getOrDefault("reference", "");
        String notes = (String) req.getOrDefault("notes", "");
        @SuppressWarnings("unchecked")
        List<String> serials = (List<String>) req.get("serialNumbers");

        Map<String, Object> res = store.stockIn(productId, quantity, purchasePrice, "usr-1", "Admin", ref, notes, serials);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/inventory/stock-out")
    public ResponseEntity<?> stockOut(@RequestBody Map<String, Object> req) {
        String productId = (String) req.get("productId");
        int quantity = ((Number) req.getOrDefault("quantity", 1)).intValue();
        double sellingPrice = ((Number) req.getOrDefault("sellingPrice", 0.0)).doubleValue();
        String customer = (String) req.getOrDefault("customerRef", "");
        String notes = (String) req.getOrDefault("notes", "");
        @SuppressWarnings("unchecked")
        List<String> serials = (List<String>) req.get("serialNumbers");

        Map<String, Object> res = store.stockOut(productId, quantity, sellingPrice, "usr-1", "Admin", customer, notes, serials);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.badRequest().body(res);
        }
    }

    @GetMapping("/inventory/transactions")
    public List<Transaction> getTransactions() {
        return store.getTransactions();
    }

    @GetMapping("/serials")
    public List<SerialImei> getSerials() {
        return store.getSerials();
    }

    @PostMapping("/serials")
    public ResponseEntity<?> addSerial(@RequestBody Map<String, String> req) {
        boolean ok = store.addSerial(req.get("productId"), req.get("serialNumber"), req.get("imei"));
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.badRequest().body(Map.of("error", "Failed to add serial"));
    }

    @PutMapping("/serials/{id}")
    public ResponseEntity<?> updateSerialStatus(@PathVariable String id, @RequestBody Map<String, String> req) {
        boolean ok = store.updateSerialStatus(id, req.getOrDefault("status", "available"));
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.notFound().build();
    }
}
