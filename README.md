# Layon Films · site oficial

Site estático (HTML, CSS e JavaScript puros, sem dependências nem etapa de build).

## Visualizar localmente

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Abra http://localhost:5173. O `serve.ps1` é só para testes locais (suporta a reprodução de vídeo com Range).
Para publicar, envie a pasta `site/` inteira para qualquer hospedagem estática (Netlify, Vercel, GitHub Pages, Hostinger etc.).

## Onde alterar

| O quê | Onde |
|---|---|
| Número do WhatsApp | `assets/js/main.js` → `WHATSAPP` (e o `href` de fallback `wa.me/5531992932034` no HTML) |
| Mensagens automáticas do WhatsApp | atributo `data-wa` de cada botão em `index.html` |
| Pacotes e preços | seção `#pacotes` em `index.html` |
| Cores e fontes | variáveis em `:root` no início de `assets/css/style.css` |
| Filmes do portfólio | cards em `#filmes` + lista `FILMS` em `assets/js/main.js` |

## Fonte das informações

Pacotes, preços, itens inclusos, diferenciais, Instagram e WhatsApp: `LayonFilms_Apresentacao_Comercial_Premium_6_Paginas.pdf`.

## Inventário de mídias

- `assets/brand/logo-layon-films.png`: logotipo original (`Logo.jpeg`) recortado com fundo transparente.
- `assets/brand/favicon-48.png`, `icon-180.png`: símbolo do leão extraído do logotipo.
- `assets/img/full/layon.jpg`: foto `Layon.jpeg` (seção Sobre).
- `assets/img/full/*.jpg`: 26 fotografias originais renomeadas; `assets/img/thumb/` tem versões de 480px para carregamento rápido.
- `assets/video/filme-01.mp4` (cerimônia, 45s), `filme-02.mp4` (making of e cerimônia, 30s, também usado na home), `filme-03.mp4` (cerimônia ao ar livre e bastidores, 21s).
- `assets/video/posters/`: quadros reais extraídos de cada vídeo.

Não foram usadas: as 3 fotos duplicadas do acervo (`01.17.37`, `01.17.38`, `01.17.39`) e a captura de tela do Instagram (`11.58.44 (11)`). A pasta Inspirações serviu apenas como referência estética.
