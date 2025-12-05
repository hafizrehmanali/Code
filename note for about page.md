How to Make the Contact Form Functional

Right now, your form is "Static." It runs entirely in the user's browser. To actually send an email, the browser needs to send the data to a Server, and the Server sends the email.

Here is how you would implement it in PHP or Node.js.

Option 1: The PHP Way (Easiest & Most Common)

PHP is built for this. If you are using XAMPP, WAMP, or almost any shared web hosting (like GoDaddy, Namecheap), PHP is built-in.

Step 1: Update your HTML

Change the opening <form> tag in contact.html. You need to tell it where to send the data and how (POST method).

Before:

<form id="contactForm" onsubmit="handleSubmit(event)">


After:

<form action="send_email.php" method="POST">


(Note: You would remove the onsubmit="handleSubmit(event)" JavaScript because PHP handles the submission now).

Step 2: Create the Backend File (send_email.php)

Create a new file named send_email.php in the same folder as your HTML file.

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Collect Data from the Form
    $name = htmlspecialchars($_POST['name']); // matches <input name="name">
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // 2. Email Details
    $to = "hrehmanstudies@gmail.com"; // Your email address
    $email_subject = "New Contact Form: $subject";
    
    $email_body = "You have received a new message from NutriChef.\n\n".
                  "Name: $name\n".
                  "Email: $email\n".
                  "Message:\n$message";

    $headers = "From: noreply@nutrichef.com\n";
    $headers .= "Reply-To: $email";

    // 3. Send Email
    if(mail($to, $email_subject, $email_body, $headers)){
        // Success: Redirect back to contact page with a success query
        header("Location: contact.html?status=success");
    } else {
        // Failure
        echo "Sorry, something went wrong. Please try again.";
    }
}
?>


Important: For this to work, you must add name="..." attributes to your HTML inputs.

<input type="text" name="name">

<input type="email" name="email">

etc.

Option 2: The Node.js Way (Modern & Professional)

If you want to stay strictly within JavaScript (the "MERN" stack style), you use Node.js. This requires a bit more setup.

Step 1: Setup

You need a server environment.

Create a folder named server.

Open terminal: npm init -y

Install packages: npm install express nodemailer cors body-parser

Step 2: Create the Server File (server.js)

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure your email service (e.g., Gmail)
// Note: For Gmail, you often need an "App Password," not your real password.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hrehmanstudies@gmail.com', 
        pass: 'YOUR_GMAIL_APP_PASSWORD' 
    }
});

app.post('/send-email', (req, res) => {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
        from: email,
        to: 'hrehmanstudies@gmail.com',
        subject: `NutriChef Contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully');
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


Step 3: Update your HTML JavaScript

In contact.html, inside your handleSubmit function, you would use fetch to send data to your Node server.

function handleSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.querySelector('input[placeholder="John Doe"]').value,
        email: document.querySelector('input[placeholder="john@example.com"]').value,
        // ... get other values
    };

    fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // Show success message (code already exists in your file)
            document.getElementById('successMessage').classList.add('active');
        }
    });
}


Which one should you choose?

Use PHP if: You are hosting on standard hosting (like Namecheap, Bluehost) or submitting this as a standard Web Engineering university project using XAMPP. It requires zero configuration to install.

Use Node.js if: You are building a React/Angular app later, or you want to learn full-stack JavaScript development.