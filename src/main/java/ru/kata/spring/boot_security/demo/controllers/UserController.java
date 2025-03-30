package ru.kata.spring.boot_security.demo.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.UserServiceImp;

import java.security.Principal;


@Controller
@RequestMapping("/api/user")
public class UserController {
    private UserServiceImp userServiceImp;

    @Autowired
    public UserController(UserServiceImp userServiceImp) {
        this.userServiceImp = userServiceImp;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userServiceImp.findByUserName(principal.getName());
        return ResponseEntity.ok(user);
    }

}
