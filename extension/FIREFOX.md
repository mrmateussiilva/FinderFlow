# Como Instalar no Firefox

## 🦊 Instalação no Firefox

### 1. Build para Firefox

```bash
cd /home/mateus/Documentos/Projetcts/FinderBit/FinderFlow/extension
~/.local/bin/pnpm build:firefox
```

### 2. Carregar no Firefox

#### Opção A: Instalação Temporária (para desenvolvimento)

1. Abra o Firefox
2. Digite na barra de endereços: `about:debugging#/runtime/this-firefox`
3. Clique em **"Carregar extensão temporária..."** (Load Temporary Add-on)
4. Navegue até a pasta `dist/` e selecione o arquivo `manifest.json`
5. A extensão será carregada (válida até fechar o Firefox)

#### Opção B: Instalação Permanente (assinada)

Para instalar permanentemente no Firefox, você precisa:

1. Criar uma conta em [addons.mozilla.org](https://addons.mozilla.org/developers/)
2. Empacotar a extensão como `.zip`:
   ```bash
   cd dist
   zip -r ../whatsapp-crm-firefox.zip *
   ```
3. Enviar para revisão no Mozilla Add-ons
4. Aguardar aprovação (pode levar alguns dias)

**OU** usar o Firefox Developer Edition/Nightly com `xpinstall.signatures.required` desabilitado.

### 3. Testar no WhatsApp Web

1. Abra `https://web.whatsapp.com`
2. Faça login (se necessário)
3. Abra qualquer conversa
4. A **sidebar do CRM** deve aparecer à direita
5. O **botão CRM** deve aparecer no canto inferior direito
6. Clique no botão para abrir o **Kanban**

## 🔄 Diferenças Chrome vs Firefox

### Manifest

**Chrome (manifest.json):**
```json
{
  "background": {
    "service_worker": "background.js"
  }
}
```

**Firefox (manifest.firefox.json):**
```json
{
  "background": {
    "scripts": ["background.js"]
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "whatsapp-crm@finderbit.com",
      "strict_min_version": "109.0"
    }
  }
}
```

### Build

- **Chrome**: `pnpm build` (usa `manifest.json`)
- **Firefox**: `pnpm build:firefox` (usa `manifest.firefox.json`)

### API Compatibility

A extensão usa apenas APIs padrão do WebExtensions que funcionam em ambos os navegadores:
- ✅ `chrome.storage.local` (também funciona no Firefox como `browser.storage.local`)
- ✅ Shadow DOM
- ✅ Content Scripts
- ✅ MutationObserver

## 🐛 Troubleshooting Firefox

### Extensão não carrega

1. Verifique se você usou `pnpm build:firefox`
2. Confirme que o arquivo `manifest.json` na pasta `dist/` tem a seção `browser_specific_settings`
3. Veja o console de erros em `about:debugging`

### Sidebar não aparece

1. Recarregue a página do WhatsApp Web
2. Abra o console do navegador (F12) e procure por erros
3. Verifique se a extensão está ativa em `about:debugging`

### Dados não persistem

- O Firefox pode ter configurações de privacidade mais restritivas
- Verifique se cookies/storage estão permitidos para `web.whatsapp.com`

## 📝 Comandos Úteis

```bash
# Build para Chrome
pnpm build

# Build para Firefox
pnpm build:firefox

# Watch mode Chrome
pnpm dev

# Watch mode Firefox
pnpm dev:firefox
```

## 🔒 Permissões

A extensão solicita:
- **storage**: Para salvar dados do CRM localmente
- **activeTab**: Para acessar a aba do WhatsApp Web
- **scripting**: Para injetar o content script
- **host_permissions**: Apenas para `https://web.whatsapp.com/*`

Todas as permissões são necessárias e seguras.

## ✅ Compatibilidade

- **Firefox**: 109.0 ou superior
- **Chrome**: 88 ou superior
- **Edge**: 88 ou superior (use o build do Chrome)
- **Opera**: 74 ou superior (use o build do Chrome)

## 🎯 Próximos Passos

Se quiser publicar oficialmente:

1. **Chrome Web Store**: Requer taxa única de $5
2. **Firefox Add-ons**: Gratuito, mas requer revisão
3. **Edge Add-ons**: Gratuito, aceita extensões do Chrome

A extensão está pronta para uso em ambos os navegadores! 🚀
