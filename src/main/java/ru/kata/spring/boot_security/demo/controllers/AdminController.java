package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleServiceImp;
import ru.kata.spring.boot_security.demo.services.UserServiceImp;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserServiceImp userServiceImp;
    private final RoleServiceImp roleServiceImp;


    @Autowired
    public AdminController(UserServiceImp userServiceImp, RoleServiceImp roleServiceImp) {
        this.userServiceImp = userServiceImp;
        this.roleServiceImp = roleServiceImp;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userServiceImp.findByUserName(principal.getName());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userServiceImp.findAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getByIdUser(@PathVariable Long id) {
        return ResponseEntity.ok(userServiceImp.findById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userServiceImp.saveUser(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser,
            Principal principal
    ) {

        User existingUser = userServiceImp.findById(id);

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setAge(updatedUser.getAge());
        existingUser.setRoles(updatedUser.getRoles());


        if (updatedUser.getPassword() != null
                && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getRoles() == null || updatedUser.getRoles().isEmpty()) {
            updatedUser.setRoles(existingUser.getRoles());
        }

        User savedUser = userServiceImp.updateUser(existingUser, updatedUser.getPassword());
        if (principal.getName().equals(existingUser.getUsername())) {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    savedUser, savedUser.getPassword(), savedUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleServiceImp.getAllRoles());
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        userServiceImp.deleteUser(id);
        return "user with id = " + id + " deleted";
    }
}

