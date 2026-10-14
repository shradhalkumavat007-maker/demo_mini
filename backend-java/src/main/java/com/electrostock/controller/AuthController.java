package com.electrostock.controller;

import com.electrostock.model.User;
import com.electrostock.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final DataStore store = DataStore.getInstance();

    /**
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     * Returns user object on success, 401 on failure.
     * Demo passwords: admin123 / manager123 / staff123
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "").trim();

        if (email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        // Look up user by email
        Optional<User> userOpt = store.getUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials. Check email and password."));
        }

        User user = userOpt.get();

        // Demo password check based on role (or password field if set)
        boolean passwordOk = false;
        String storedPass = user.getPassword();
        if (storedPass != null && !storedPass.isEmpty()) {
            passwordOk = storedPass.equals(password);
        } else {
            // Default demo passwords by role
            passwordOk = switch (user.getRole()) {
                case "admin"   -> password.equals("admin123");
                case "manager" -> password.equals("manager123");
                case "staff"   -> password.equals("staff123");
                default        -> password.length() >= 4;
            };
        }

        if (!passwordOk) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials. Check email and password."));
        }

        if ("inactive".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("error", "Your account is deactivated. Contact an Administrator."));
        }

        // Update lastLogin
        user.setLastLogin(Instant.now().toString());
        store.updateUser(user.getId(), user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    /** POST /api/auth/logout – stateless, just returns ok */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** POST /api/auth/register – self-registration for staff */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name     = body.getOrDefault("name", "").trim();
        String email    = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "").trim();

        if (name.isEmpty() || email.isEmpty() || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and a password of at least 6 characters are required."));
        }

        boolean exists = store.getUsers().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        if (exists) {
            return ResponseEntity.status(409).body(Map.of("error", "An account with this email already exists."));
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setRole("staff");
        newUser.setStatus("active");
        newUser.setCreatedAt(Instant.now().toString());
        newUser.setLastLogin(Instant.now().toString());

        User created = store.addUser(newUser);
        return ResponseEntity.ok(Map.of("success", true, "user", created));
    }
}
