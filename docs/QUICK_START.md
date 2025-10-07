# ⚡ Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Install
```bash
cd /Users/yeems214/sms-apis
npm install
```

### Step 2: Start
```bash
npm run start:dev
```

### Step 3: Test
```bash
# Open browser to:
http://localhost:3000/api

# Or use curl:
curl http://localhost:3000/api/mmda/traffic
```

**That's it! Your API is now running! 🎉**

---

## 📍 All Endpoints

### API Info
```
GET http://localhost:3000/api
```

### MMDA Traffic (4 endpoints)
```bash
GET http://localhost:3000/api/mmda/traffic          # All traffic
GET http://localhost:3000/api/mmda/highways         # Highways
GET http://localhost:3000/api/mmda/segments         # Segments
GET http://localhost:3000/api/mmda/traffic/edsa     # By highway
```

### PAGASA Weather (3 endpoints)
```bash
GET http://localhost:3000/api/pagasa/forecast           # Forecast
GET http://localhost:3000/api/pagasa/severe-weather     # Alerts
GET http://localhost:3000/api/pagasa/tropical-cyclones  # Cyclones
```

### PHIVOLCS Seismic (4 endpoints)
```bash
GET http://localhost:3000/api/phivolcs/earthquakes         # All quakes
GET http://localhost:3000/api/phivolcs/latest-earthquake   # Latest
GET http://localhost:3000/api/phivolcs/volcanoes           # All volcanoes
GET http://localhost:3000/api/phivolcs/volcanoes/mayon     # Specific
```

---

## 🧪 Test with cURL

```bash
# Test MMDA
curl http://localhost:3000/api/mmda/traffic | jq

# Test PAGASA
curl http://localhost:3000/api/pagasa/forecast | jq

# Test PHIVOLCS
curl http://localhost:3000/api/phivolcs/earthquakes | jq
```

---

## 💻 Test with JavaScript

```javascript
// Vanilla JavaScript
fetch('http://localhost:3000/api/mmda/traffic')
  .then(res => res.json())
  .then(data => console.log(data));

// Async/Await
const getTraffic = async () => {
  const response = await fetch('http://localhost:3000/api/mmda/traffic');
  const data = await response.json();
  console.log(data);
};
```

---

## 📦 Available npm Scripts

```bash
npm run start          # Start production
npm run start:dev      # Start development (watch mode)
npm run start:debug    # Start with debugger
npm run build          # Build for production
npm run lint           # Run linter
npm run format         # Format code
```

---

## 📁 Project Files

| File | Purpose |
|------|---------|
| `README.md` | Full documentation |
| `SETUP.md` | Detailed setup guide |
| `QUICK_START.md` | This file - quick reference |
| `API_EXAMPLES.md` | Code examples |
| `ALTERNATIVES.md` | Other data sources |
| `ARCHITECTURE.md` | System design |
| `SOLUTION_ANALYSIS.md` | Recommendations |
| `PROJECT_SUMMARY.md` | Complete overview |

---

## ⚙️ Configuration

Edit `.env` to customize:

```env
PORT=3000                    # Change server port
CACHE_TTL=300               # Cache duration (seconds)
```

---

## 🔧 Common Tasks

### Change Port
```env
# Edit .env
PORT=4000
```

### Clear Cache
```bash
# Just restart the server
# Ctrl+C then npm run start:dev
```

### View Logs
```bash
# Logs appear in terminal where you ran npm run start:dev
```

### Deploy to Production
```bash
npm run build
npm run start:prod
```

---

## ❓ Troubleshooting

### Port already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
```

### No data returned?
- Check internet connection
- Verify source websites are accessible
- Check console for error messages

### Installation errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learn More

- **Full Docs**: Read `README.md`
- **Code Examples**: See `API_EXAMPLES.md`
- **Better APIs**: Check `ALTERNATIVES.md`
- **System Design**: Review `ARCHITECTURE.md`

---

## 🎯 Next Steps

1. ✅ Test all endpoints
2. 📖 Read `README.md` for details
3. 💡 Check `API_EXAMPLES.md` for integration
4. 🚀 Build your application!

---

## 🆘 Need Help?

1. Check console for error messages
2. Read the documentation files
3. Verify .env configuration
4. Test source URLs in browser

---

## 🎊 You're Ready!

The API is working and ready to use. Start building! 🚀

**Happy coding!** 👨‍💻👩‍💻



