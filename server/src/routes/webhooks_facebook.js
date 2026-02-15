const express = require("express");
const router = express.Router();
const axios = require("axios");

// Helper function to log errors
const logError = (step, error) => {
    console.error(`Error during step: ${step}`);
    if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
    } else if (error.request) {
        console.error("Request:", error.request);
    } else {
        console.error("Error Message:", error.message);
    }
};

// 1. Webhook Verification Endpoint
router.get("/", (req, res) => {
    const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
    const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'flow_estate_secret';

    if (mode && token) {
        if (mode === "subscribe" && token === FACEBOOK_VERIFY_TOKEN) {
            console.log("Webhook verified successfully!");
            res.status(200).send(challenge);
        } else {
            console.log("Webhook verification failed.");
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// 2. Webhook Handler for Lead Events
router.post("/", async (req, res) => {
    const { object, entry } = req.body;

    // Respond immediately to prevent timeouts
    res.sendStatus(200);

    if (object === "page") {
        for (const pageEntry of entry) {
            for (const change of pageEntry.changes) {
                if (change.field === "leadgen") {
                    const { leadgen_id, page_id, form_id } = change.value;
                    console.log(`New lead event received: leadgen_id=${leadgen_id}`);

                    try {
                        // IMPORTANT: You need a valid Page Access Token for the page_id
                        // For now attempting process.env, but ideally this should come from DB
                        const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

                        if (!pageAccessToken) {
                            console.error("FATAL: Page Access Token is not configured. Configure FACEBOOK_PAGE_ACCESS_TOKEN in env for now.");
                            continue; // Skip processing this lead
                        }

                        console.log(`Fetching lead details for leadgen_id: ${leadgen_id}`);
                        const leadDetailsResponse = await axios.get(
                            `https://graph.facebook.com/v19.0/${leadgen_id}`,
                            {
                                params: {
                                    access_token: pageAccessToken,
                                    fields: "id,created_time,field_data",
                                },
                            }
                        );

                        const leadData = leadDetailsResponse.data;
                        console.log("Lead details fetched:", JSON.stringify(leadData, null, 2));

                        // TODO: Process and save the leadData to your CRM database.
                        // Since we are in the 'refactoring' step, I will log it for now.
                        // Ideally call a db service here.

                    } catch (e) {
                        logError("Fetching Lead Details", e);
                    }
                }
            }
        }
    }
});

module.exports = router;
