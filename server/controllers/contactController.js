const submitContactMessage = async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  console.log("Contact form submission:", {
    name,
    email,
    message,
    submittedAt: new Date().toISOString(),
  });

  return res.status(200).json({ message: "Message received successfully." });
};

module.exports = {
  submitContactMessage,
};
