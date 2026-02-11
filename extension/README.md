# WhatsApp CRM Kanban Extension

Transform WhatsApp Web into a powerful mini CRM with Kanban board functionality.

## 🎯 Features

- **CRM Sidebar**: Manage conversation stages, tags, and notes directly in WhatsApp Web
- **Kanban Board**: Visualize all conversations across 4 pipeline stages
- **Drag & Drop**: Move conversations between stages with intuitive drag and drop
- **Local Storage**: All data stored locally in your browser (chrome.storage.local)
- **Shadow DOM**: Isolated CSS prevents conflicts with WhatsApp's interface
- **Auto-save**: Notes and changes save automatically

## 📋 Pipeline Stages

1. **Novo** - New leads
2. **Atendimento** - In service/conversation
3. **Proposta** - Proposal sent
4. **Fechado** - Closed/completed

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- PNPM (installed locally in `~/.local/bin/pnpm`)

### Build the Extension

**For Chrome:**
```bash
# Install dependencies
pnpm install

# Build the extension
pnpm build
```

**For Firefox:**
```bash
# Install dependencies
pnpm install

# Build for Firefox
pnpm build:firefox
```

The compiled extension will be in the `dist/` folder.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project

### Load in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Navigate to the `dist/` folder and select `manifest.json`
4. The extension will be loaded (temporary - valid until Firefox restart)

**For permanent installation in Firefox**, see [FIREFOX.md](FIREFOX.md) for detailed instructions.

## 🛠️ Development

```bash
# Watch mode (rebuilds on file changes)
pnpm dev
```

After making changes, go to `chrome://extensions` and click the refresh icon on the extension card.

## 📦 Project Structure

```
extension/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icon.png               # Extension icon
├── src/
│   ├── background.ts          # Service worker
│   ├── contentScript.ts       # Content script entry point
│   ├── injectRoot.tsx         # React app injection
│   ├── crm-ui/
│   │   ├── App.tsx            # Main app component
│   │   ├── Sidebar.tsx        # CRM sidebar
│   │   ├── FloatingButton.tsx # CRM button
│   │   ├── KanbanModal.tsx    # Kanban modal
│   │   ├── KanbanBoard.tsx    # Kanban board with drag & drop
│   │   ├── ConversationCard.tsx # Card component
│   │   └── styles.css         # Isolated CSS
│   ├── store/
│   │   └── store.ts           # Zustand state management
│   └── utils/
│       ├── dom.ts             # WhatsApp DOM utilities
│       └── storage.ts         # Chrome storage wrapper
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔒 Privacy & Security

This extension:

- ✅ Only observes visible DOM elements
- ✅ Stores data locally in your browser
- ✅ Does NOT send any data to external servers
- ✅ Does NOT automate message sending
- ✅ Does NOT intercept network traffic
- ✅ Does NOT use private WhatsApp APIs

## 🎨 Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **Shadow DOM** - CSS isolation
- **Chrome Manifest V3** - Extension platform

## 📝 Usage

1. Open WhatsApp Web (`https://web.whatsapp.com`)
2. Click on any conversation
3. The **CRM sidebar** appears on the right with:
   - Stage selector
   - Tags management
   - Notes (auto-saves)
4. Click the **CRM button** (bottom-right) to open the Kanban board
5. Drag conversations between columns to update their stage

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure you built the project (`pnpm build`)
- Check that Developer mode is enabled in Chrome
- Try removing and re-adding the extension

**Sidebar not appearing?**
- Refresh WhatsApp Web
- Make sure you have a conversation open
- Check the browser console for errors

**Data not persisting?**
- Check Chrome storage permissions
- Try clearing extension data and reloading

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

This is an MVP. Future improvements could include:
- Export/import data
- Custom pipeline stages
- Search and filters
- Analytics dashboard
- Multi-language support
