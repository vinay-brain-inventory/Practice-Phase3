function userProfile(req, res) {
  return res.status(200).json({ user: req.user });
}

function adminOnly(_req, res) {
  return res.status(200).json({ ok: true });
}

module.exports = { userProfile, adminOnly };

