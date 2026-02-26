import {validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';
import { loginValidation } from '../../middleware/validation/forms.js';

const router = Router();


/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'User Login'
    })
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
        req.flash('error', error.msg);
        });
        // Redirect back to form without saving
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {

        const user = await findUserByEmail(email);

        if(!user){
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login');
        }

        const passwordIsValid = await verifyPassword(password, user.password);

        if(!passwordIsValid){
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login');
        }


        delete user.password;
        req.flash('success', 'Successfully logged in')
        req.session.user = user;
        return res.redirect('/dashboard')
        
    } catch (error) {
        console.error("Error during login:", error)
        req.flash('error', 'Error during login')
        return res.redirect('/login');
    }
};

/**
 * Handle user logout.
 * 
 * NOTE: connect.sid is the default session cookie name since we did not
 * specify a custom name when creating the session in server.js.
 */
const processLogout = (req, res) => {

    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy((err) => {
        if (err) {

            console.error('Error destroying session:', err);

            res.clearCookie('connect.sid');

            return res.redirect('/');
        }

        res.clearCookie('connect.sid');

        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    return res.render('dashboard', {
        title: 'Dashboard',
        user: user,
        sessionData: sessionData
    })
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout, showDashboard };