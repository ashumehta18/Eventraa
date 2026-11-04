exports.submitSupportRequest = async (req, res) => {
  const { name, email, category, subject, issue } = req.body;

  if (!name || !email || !category || !subject || !issue) {
    return res.status(400).json({ message: "All fields are required" });
  }

  console.log("📩 Support Request Received:");
  console.log({ name, email, category, subject, issue });

  res.status(201).json({
    message: "Support request submitted successfully",
  });
};
