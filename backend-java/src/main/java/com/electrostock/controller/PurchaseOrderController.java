package com.electrostock.controller;

import com.electrostock.model.PurchaseOrder;
import com.electrostock.model.Warranty;
import com.electrostock.service.DataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final DataStore store = DataStore.getInstance();

    @GetMapping("/purchase-orders")
    public List<PurchaseOrder> getPurchaseOrders() {
        return store.getPurchaseOrders();
    }

    @PostMapping("/purchase-orders")
    public ResponseEntity<PurchaseOrder> createPO(@RequestBody PurchaseOrder po) {
        po.setUserId("usr-1");
        po.setUserName("Admin");
        PurchaseOrder created = store.createPurchaseOrder(po);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/purchase-orders/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        boolean ok = store.updatePOStatus(id, body.getOrDefault("status", "pending"));
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.notFound().build();
    }

    @PostMapping("/purchase-orders/{id}/receive")
    public ResponseEntity<?> receivePO(@PathVariable String id) {
        boolean ok = store.receivePurchaseOrder(id, "usr-1", "Admin");
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.badRequest().body(Map.of("error", "Unable to receive PO"));
    }

    @GetMapping("/warranties")
    public List<Warranty> getWarranties() {
        return store.getWarranties();
    }

    @PostMapping("/warranties")
    public ResponseEntity<Warranty> addWarranty(@RequestBody Warranty warranty) {
        Warranty created = store.addWarranty(warranty);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/warranties/{id}/claims")
    public ResponseEntity<?> claimWarranty(@PathVariable String id, @RequestBody Map<String, String> body) {
        boolean ok = store.claimWarranty(
            id,
            body.getOrDefault("issueDescription", ""),
            body.getOrDefault("status", "in_repair"),
            body.getOrDefault("resolutionNotes", "")
        );
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.notFound().build();
    }
}
