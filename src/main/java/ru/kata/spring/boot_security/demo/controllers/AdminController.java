package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleServiceImp;
import ru.kata.spring.boot_security.demo.services.UserServiceImp;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserServiceImp userServiceImp;
    private final RoleServiceImp roleServiceImp;


    @Autowired
    public AdminController(UserServiceImp userServiceImp, RoleServiceImp roleServiceImp) {
        this.userServiceImp = userServiceImp;
        this.roleServiceImp = roleServiceImp;
    }

    @GetMapping()
    public String Users(Model model) {
        List<User> user = userServiceImp.findAllUsers();
        model.addAttribute("allUsers", user);
        return "admin";
    }

    @GetMapping("addNewUser")
    public String saveUser(Model model) {
        model.addAttribute("save", new User());
        model.addAttribute("roles", roleServiceImp.getAllRoles());
        return "user-info";
    }

    @PostMapping("/saveUsers")
    public String saveUser(@ModelAttribute("save") User user) {
        userServiceImp.saveUser(user);
        return "redirect:/admin";
    }

    @GetMapping("/updateUser")
    public String updateUsers(@RequestParam(value = "username") String username, Model model) {
        model.addAttribute("updateUserId", userServiceImp.findByUserName(username));
        model.addAttribute("roles", roleServiceImp.getAllRoles());
        return "update";
    }

    @PostMapping("updateUserById")
    public String updateUserById(
            @ModelAttribute("updateUserId") User user,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            Principal principal) {
        User existingUser = userServiceImp.findById(user.getId());
        userServiceImp.updateUser(user, newPassword);

        if (principal.getName().equals(existingUser.getUsername())) {
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    existingUser, existingUser.getPassword(), existingUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        if (existingUser.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"))) {
            return "redirect:/admin";
        } else if (existingUser.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_USER"))) {
            return "redirect:/user";
        } else {
            return "redirect:/login";
        }
    }

    @GetMapping("deleteUser")
    public String deleteUserById(@RequestParam(value = "id") Long id) {
        userServiceImp.deleteUser(id);
        return "redirect:/admin";
    }
}
