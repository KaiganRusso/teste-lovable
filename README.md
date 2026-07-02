# 3D Profit Manager
Gerenciador completo **online** para makers de impressora 3D — calcule custos, precifique com inteligência, controle vendas e gastos, tudo no navegador. Hospedagem 100% estática, ideal para **GitHub Pages**.
> Feito apenas com **HTML5 + CSS3 + JavaScript puro** — sem frameworks, sem backend, sem dependências.
---
## ✨ Funcionalidades
### 1. Calculadora de Custo e Lucro
- Nome do produto/impressão
- Peso de filamento (g) + preço por kg
- Tempo de impressão (h) e potência da impressora (W)
- Preço da energia (R$/kWh)
- **Materiais extras** dinâmicos (cola, fita, nozzle, tinta…)
- **Outros gastos** personalizados
- Cálculo automático do custo total
### 2. Precificação Inteligente
Sugestão de preço de venda com multiplicadores:
- **2× — Lucro mínimo**
- **3× — Lucro ideal**
- **4× — Lucro alto**
### 3. Gestão de Vendas
Tabela com produto, data, custo, preço de venda, lucro líquido e status (Vendido / Pendente — clicável para alternar).
### 4. Gestão de Gastos
Tabela editável de materiais e gastos extras, com adicionar, editar (in-line) e excluir.
### 5. Relatórios
Total vendido, lucro líquido, gastos, vendas concluídas, pendentes e ticket médio.
### 6. Extras
- 💾 **LocalStorage** — nada sai do seu navegador
- 📤 Exportar **JSON / CSV** por seção
- 🔁 Backup completo (exportar / importar / apagar tudo)
- 🎨 **Dark mode** moderno e **100% responsivo**
- 🗂️ Navegação por abas: Calculadora, Vendas, Gastos, Relatórios
---
## 📁 Estrutura
```
.
├── index.html      # Estrutura da interface
├── style.css       # Tema escuro, responsivo
├── script.js       # Lógica, cálculo, LocalStorage e exportação
└── README.md
```
---
## 🚀 Como usar localmente
Basta abrir `index.html` no navegador — não precisa de servidor.
```bash
# opcional, para servir localmente
npx serve .
```
---
## 🌐 Publicando no GitHub Pages
1. Crie um repositório novo no GitHub (ex: `3d-profit-manager`).
2. Envie os arquivos (`index.html`, `style.css`, `script.js`, `README.md`) para a branch `main`.
3. No GitHub, vá em **Settings → Pages**.
4. Em **Source**, selecione `Deploy from a branch` → `main` → `/root` → **Save**.
5. Aguarde alguns segundos. Seu app estará no ar em:
```
https://SEU-USUARIO.github.io/3d-profit-manager/
```
---
## 🧮 Fórmulas usadas
- **Custo do filamento** = `(gramas / 1000) × preço por kg`
- **Custo de energia** = `(watts / 1000) × horas × preço do kWh`
- **Custo total** = `filamento + energia + extras + outros`
- **Sugestão de preço** = `custo total × { 2, 3, 4 }`
- **Lucro** = `preço de venda − custo total`
---
## 🔒 Privacidade
Todos os dados ficam **somente no seu navegador** (LocalStorage). Nenhuma informação é enviada a servidores. Se limpar o cache do navegador, os dados serão apagados — use o **Backup (JSON)** na aba Relatórios para salvar cópias.
---
## 🛠️ Tecnologias
- HTML5 semântico
- CSS3 (Grid, Flexbox, variáveis, gradient, dark mode nativo)
- JavaScript ES6+ (módulos simples, sem build step)
---
## 📄 Licença
MIT — use, modifique e compartilhe livremente.
