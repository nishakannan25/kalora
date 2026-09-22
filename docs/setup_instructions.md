# KALORA — Setup & Execution Instructions

## Environment Requirements
- Python 3.9+
- Node.js 18+ and `npm` / `npx`
- Expo CLI (`npx expo`)

---

## 1. Quickstart Installation

```bash
# Clone repository
git clone https://github.com/kalora/kalora-platform.git
cd kalora

# Install Python dependencies
pip install -r requirements.txt

# Install Mobile App dependencies
cd mobile
npm install
cd ..
```

---

## 2. Running End-to-End Tests

```bash
# Run unit & integration test suite (Phase 6 to Phase 12)
python -m unittest discover -s tests -p "test_*.py"
```

---

## 3. Running Mobile App locally (Expo)

```bash
cd mobile
npx expo start
```

Scan the generated QR code using the Expo Go mobile app on Android/iOS.

---

## 4. Accessing Public Pages & Admin Dashboard

- **Admin Dashboard**: Open `public/admin/dashboard.html` in browser.
- **Public Craft Passports**: Open `public/passports/[product_id].html` in browser.
