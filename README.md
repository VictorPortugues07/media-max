# Prompt de Desenvolvimento — MVP de Validação da Media Max

## Contexto para quem for desenvolver

Você vai construir o **MVP de validação de mercado** da Media Max, uma plataforma de mídia indoor (marketplace de dois lados) que conecta:

- **Estabelecimentos com TVs** (academias, barbearias, clínicas, restaurantes, etc.) que podem transformar suas telas em espaço publicitário remunerado.
- **Anunciantes** que querem divulgar produtos/serviços para o público que frequenta fisicamente esses locais.

**Importante: este NÃO é o produto final.** Não é para desenvolver o sistema de exibição de anúncios nas TVs, o mapa interativo, o processamento de pagamento ou o player de conteúdo. O objetivo desta fase é **validar se existe interesse real dos dois lados do marketplace**, coletando dados qualificados de leads através de formulários bem desenhados, e demonstrar tração social (quantidade de cadastros) para aumentar a confiança de quem está preenchendo.

O sucesso deste MVP é medido por: quantidade de estabelecimentos cadastrados, quantidade de anunciantes cadastrados, e principalmente quantos respondem "sim" para a pergunta de intenção real de uso.

---

## 1. Stack sugerida

- **Frontend:** Next.js (React) + Tailwind CSS — permite SSR/SEO para a landing e páginas rápidas de formulário.
- **Backend:** API routes do próprio Next.js ou um backend simples em Node/Express.
- **Banco de dados:** PostgreSQL (ou SQLite para o MVP, se for algo bem simples de hospedar).
- **Autenticação do admin:** login simples com usuário/senha (sessão via cookie/JWT), sem necessidade de sistema de permissões complexo.
- **Integração externa:** ViaCEP (`https://viacep.com.br/ws/{cep}/json/`) para autopreenchimento de endereço a partir do CEP.
- **Hospedagem:** Vercel (frontend) + banco gerenciado (Neon, Supabase ou Railway).

Se preferir uma stack mais simples para validar rápido, HTML/CSS/JS + backend leve (Node + SQLite) também resolve — o importante é lançar rápido, não a sofisticação técnica.

---

## 2. Mapa de páginas/rotas

| Rota                        | Descrição                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/`                         | Landing page: explica o projeto, mostra prova social (nº de cadastros), CTAs para os dois formulários |
| `/sobre` (ou seção na home) | Explicação detalhada do conceito da Media Max                                                         |
| `/cadastro/ponto`           | Formulário para quem possui (ou tem interesse em ter) TV disponível                                   |
| `/cadastro/anunciante`      | Formulário para quem quer anunciar                                                                    |
| `/obrigado`                 | Página de confirmação pós-cadastro, reforçando prova social e próximos passos                         |
| `/admin/login`              | Login do painel administrativo                                                                        |
| `/admin`                    | Dashboard com todos os cadastros, filtros e métricas                                                  |

---

## 3. Landing page (`/`)

Deve deixar claro em poucos segundos:

1. **O problema:** TVs em estabelecimentos físicos ficam subutilizadas, e empresas locais têm dificuldade de anunciar para quem está fisicamente próximo.
2. **A solução:** Media Max conecta os dois lados — quem tem tela ganha uma renda extra, quem quer anunciar alcança clientes da região.
3. **Prova social dinâmica** (ver seção 6): "X estabelecimentos e Y anunciantes já demonstraram interesse na sua região".
4. **Dois CTAs bem distintos**, um para cada público:
   - "Tenho uma TV no meu estabelecimento" → `/cadastro/ponto`
   - "Quero anunciar" → `/cadastro/anunciante`
5. Uma seção explicando o **passo a passo de como vai funcionar** quando a plataforma estiver no ar (cadastro → conexão → campanha), para dar contexto de para onde esse cadastro está levando.
6. Depoimento/exemplo fictício ilustrativo (o exemplo da academia e da barbearia do documento de referência funciona bem aqui, adaptado de forma resumida).

---

## 4. Formulário — Ponto de mídia (quem possui/quer ter TV)

**Rota:** `/cadastro/ponto`

### Regras de UX (aplicam-se a ambos os formulários)

- Dividir em **etapas curtas** (wizard/multi-step), com barra de progresso — nunca mostrar tudo de uma vez.
- Agrupar por blocos lógicos: (1) Sobre a empresa, (2) Sobre a TV/estabelecimento, (3) Sobre o público, (4) Interesse comercial.
- Máximo de 3–5 campos visíveis por etapa.
- Campos verdadeiramente opcionais devem ser marcados como "opcional" e não bloquear o avanço.
- Botão de "Voltar" disponível em todas as etapas.
- Auto-save local (localStorage do navegador, não storage do artifact) para não perder o progresso se a pessoa fechar a aba.
- Linguagem simples, sem jargão técnico de publicidade.

### Campos

**Bloco 1 — Sobre a empresa**

- Nome da empresa _(obrigatório)_
- Nome do responsável _(obrigatório)_
- WhatsApp _(obrigatório, com máscara de telefone)_
- Instagram e/ou site _(opcional)_
- CEP _(obrigatório — usar ViaCEP para autopreencher rua, bairro, cidade, UF)_
- Número e complemento _(obrigatório/opcional)_
- Categoria do estabelecimento _(select: Academia, Barbearia/Salão, Clínica/Consultório, Restaurante/Lanchonete, Loja de varejo, Escritório/Coworking, Outro — com campo livre se "Outro")_
- Descrição curta do estabelecimento _(textarea, obrigatório, placeholder orientando o que escrever)_

**Bloco 2 — Sobre a TV**

- Já possui TV disponível no estabelecimento? _(sim / não, mas tenho interesse em instalar)_
- Se sim: quantidade de TVs _(número)_
- Onde as TVs estão instaladas _(ex: recepção, área de espera, sala de musculação — campo livre ou checkboxes com "outro")_

**Bloco 3 — Sobre o público**

- Estimativa de pessoas que frequentam o estabelecimento por dia _(faixas: até 50 / 50–150 / 150–400 / 400–800 / mais de 800)_
- Tempo médio de permanência das pessoas no local _(faixas: até 15 min / 15–30 min / 30–60 min / mais de 1h)_
- Faixa etária predominante do público _(multi-select: 18-24, 25-34, 35-44, 45-59, 60+)_
- Gênero predominante do público _(select: majoritariamente masculino / majoritariamente feminino / equilibrado)_
- Horários de maior movimento _(opcional, campo livre ou multi-select de períodos)_

**Bloco 4 — Interesse comercial**

- Quanto você gostaria de receber mensalmente para disponibilizar sua TV para anúncios? _(faixas: até R$100 / R$100-200 / R$200-400 / R$400+ / não sei dizer)_
- Categorias de anunciantes que NÃO gostaria de aceitar _(multi-select: concorrentes diretos, bebidas alcoólicas, tabaco, conteúdo adulto, política, apostas/jogos, outro)_

**Bloco 5 — Validação de intenção (destacar visualmente)**

- **Pergunta-chave:** "Se encontrarmos hoje uma empresa interessada em anunciar no seu estabelecimento, você estaria disposto a disponibilizar sua TV?" _(Sim, tenho interesse real / Talvez, quero entender melhor / Não, só por curiosidade)_
- "Posso entrar em contato com você quando a Media Max estiver disponível?" _(Sim / Não)_

---

## 5. Formulário — Anunciante

**Rota:** `/cadastro/anunciante`

Mesma lógica de wizard multi-etapa.

**Bloco 1 — Sobre a empresa**

- Nome da empresa _(obrigatório)_
- Nome do responsável _(obrigatório)_
- WhatsApp _(obrigatório)_
- Instagram e/ou site _(opcional)_
- CEP / localização _(obrigatório, via ViaCEP)_
- Categoria da empresa _(mesmo padrão do formulário de ponto)_

**Bloco 2 — O que deseja anunciar**

- O que você quer divulgar? _(select: Produto / Serviço / Promoção / Avaliação gratuita / Evento / Marca institucional / Outro)_
- Descrição curta do que será anunciado _(textarea)_

**Bloco 3 — Onde quer anunciar**

- Preferência de localização _(select: Próximo ao meu estabelecimento / Bairros específicos / Categorias de empresas específicas / Não tenho preferência)_
- Se "próximo ao estabelecimento": distância máxima desejada _(select: até 1km / até 3km / até 5km / até 10km)_
- Se "bairros específicos": campo de texto livre para listar bairros
- Se "categorias específicas": multi-select das mesmas categorias usadas no formulário de ponto

**Bloco 4 — Público-alvo**

- Faixa etária desejada _(multi-select, mesmas opções do outro formulário)_
- Gênero _(select: homens / mulheres / ambos)_

**Bloco 5 — Investimento**

- Quanto estaria disposto a investir mensalmente? _(faixas: até R$200 / R$200-500 / R$500-1000 / R$1000+ / não sei dizer)_
- Já investe em publicidade hoje? _(Sim / Não)_
- Se sim, onde? _(multi-select: Instagram/Facebook Ads, Google Ads, Outdoor, Influenciadores, Panfletagem, Rádio, Outro)_

**Bloco 6 — Validação de intenção (destacar visualmente)**

- **Pergunta-chave:** "Se encontrarmos hoje um estabelecimento adequado ao seu público, você estaria disposto a contratar uma campanha?" _(Sim, tenho interesse real / Talvez, quero entender melhor / Não, só por curiosidade)_
- "Posso entrar em contato com você quando a Media Max estiver disponível?" _(Sim / Não)_

---

## 6. Prova social (mecânica de "rede em construção")

Depois que alguém envia qualquer um dos dois formulários:

1. É redirecionado para `/obrigado`, que mostra uma mensagem de confirmação **e** um resumo tipo: "Você agora faz parte da rede Media Max em [cidade]. Hoje já temos **N estabelecimentos** com TVs disponíveis e **M anunciantes** interessados em [cidade/região]."
2. O cadastro passa a contar como um "ponto" ou "anunciante" ativo nas estatísticas exibidas publicamente — não é necessário mostrar dados sensíveis (WhatsApp, valores exatos), apenas: nome da empresa (ou nome + categoria), cidade/bairro, categoria.
3. Na landing page (`/`), incluir uma seção com **contador em tempo real** (ex: "37 estabelecimentos e 24 anunciantes já demonstraram interesse") e, se possível, uma lista/carrossel com os últimos cadastros (nome da empresa + categoria + cidade), tipo "prova social ao vivo".
4. Essa contagem deve vir de uma consulta real ao banco de dados (não hardcoded), atualizando conforme os cadastros entram.

Isso reforça a sensação de rede em crescimento tanto para quem ainda vai preencher quanto para quem já preencheu.

---

## 7. Painel administrativo

**Rotas:** `/admin/login` e `/admin`

- Login simples com usuário/senha fixos (definidos por variável de ambiente), sem necessidade de sistema de múltiplos administradores nesta fase.
- Dashboard com:
  - Contadores gerais: total de pontos cadastrados, total de anunciantes, quantos responderam "Sim" na pergunta de intenção real (separado por tipo).
  - Tabela filtrável/pesquisável de todos os cadastros (pontos e anunciantes em abas separadas), com todos os campos preenchidos visíveis.
  - Filtros por: categoria, cidade/bairro, faixa de valor desejado/disponível, resposta da pergunta de intenção, se autorizou contato.
  - Exportação para CSV (para facilitar follow-up comercial fora da plataforma).
  - Ordenação por data de cadastro (mais recentes primeiro).

Não é necessário: edição de cadastros, múltiplos níveis de permissão, notificações — manter simples.

---

## 8. Página "Sobre o projeto"

Uma aba/seção dedicada (pode estar na própria landing, em âncora, ou em rota separada `/sobre`) explicando com calma:

- O problema que a Media Max resolve.
- Como funciona a conexão entre pontos de mídia e anunciantes.
- O exemplo prático (ex: academia com TVs conectada a uma barbearia anunciante), para tornar o conceito tangível.
- Deixar claro que esta é uma fase de validação e que o cadastro **não gera cobrança nem compromisso**, apenas registra interesse.

---

## 9. Modelo de dados sugerido

```
pontos_midia
- id
- nome_empresa
- responsavel
- whatsapp
- instagram_site
- cep, rua, numero, complemento, bairro, cidade, uf
- categoria
- descricao
- possui_tv (bool)
- quantidade_tvs
- local_instalacao
- fluxo_diario_estimado (faixa)
- tempo_permanencia (faixa)
- faixa_etaria_publico (array)
- genero_publico
- horarios_pico
- valor_desejado (faixa)
- categorias_recusadas (array)
- intencao_real (enum: sim / talvez / nao)
- aceita_contato (bool)
- criado_em

anunciantes
- id
- nome_empresa
- responsavel
- whatsapp
- instagram_site
- cep, rua, numero, complemento, bairro, cidade, uf
- categoria
- o_que_anunciar (tipo + descricao)
- preferencia_localizacao
- distancia_maxima
- bairros_especificos
- categorias_especificas (array)
- faixa_etaria_alvo (array)
- genero_alvo
- valor_investimento (faixa)
- ja_investe_publicidade (bool)
- onde_investe (array)
- intencao_real (enum: sim / talvez / nao)
- aceita_contato (bool)
- criado_em

admin_users
- id
- usuario
- senha_hash
```

---

## 10. Tom e cuidados gerais

- **Não cansar o usuário:** priorizar poucos campos obrigatórios, usar seleção por faixas/opções em vez de números exatos sempre que possível, permitir avançar rápido.
- Deixar muito claro, visualmente, que **não há custo nem compromisso** em se cadastrar.
- Destacar visualmente as perguntas de intenção real (blocos 5/6) — elas são o dado mais valioso da validação, então merecem destaque de layout (cor, box separado, etc.), não devem passar despercebidas como "mais um campo".
- Todo o texto em português, tom acessível, evitando termos técnicos de mídia programática/publicidade.
- Responsivo (mobile-first), já que grande parte dos donos de pequenos estabelecimentos vai preencher pelo celular.

Descrição da logo:

Símbolo: um ícone que mistura duas leituras ao mesmo tempo — a moldura lembra uma tela/TV (retângulo arredondado) e, ao mesmo tempo, forma um "M" estilizado através de duas hastes curvas que se cruzam no topo. Dentro da moldura há um botão de play (triângulo) em gradiente azul, reforçando a ideia de "conteúdo em exibição". No canto superior direito do símbolo, um sinal de "+" em azul se conecta à moldura, sugerindo "mais alcance", "mais valor", "mais uma camada" sobre a tela já existente.
Paleta: fundo preto absoluto, ícone em gradiente branco → azul (variando de um azul mais claro/ciano até um azul mais profundo), criando sensação tecnológica e de movimento.
Tipografia do nome: peso bold, caixa alta/baixa combinada, sans-serif geométrica e moderna, com o "+" também em azul, mantendo consistência com o símbolo.
Tagline: "CONECTA MARCAS. AMPLIFICA RESULTADOS." em caixa alta, letter-spacing aberto, primeira parte em branco e a palavra-chave ("AMPLIFICA RESULTADOS") em azul — um recurso de dar destaque cromático à promessa central da marca.

No geral é uma identidade tech, minimalista, escura e confiante — não é uma marca "fofa" ou lúdica, ela comunica seriedade e performance, o que combina bem com um produto B2B de mídia/publicidade.

Como aplicar isso na plataforma Media Max (visualmente):

Paleta de cores

Fundo: preto ou cinza-quase-preto (
#0A0A0A /
#111113) como cor dominante, especialmente na landing e no header — reforça a identidade "tela ligada no escuro".
Azul de destaque em gradiente (algo como
#3B82F6 →
#60A5FA ou um ciano mais elétrico) para CTAs, links, ícones, gráficos e o símbolo "+" reaproveitado como elemento gráfico recorrente (bullet points, marcadores de seção, indicador de "ativo/disponível").
Branco puro para textos principais, cinza-claro para textos secundários — mantendo o alto contraste que a logo já usa.
Evitar cores quentes (vermelho, laranja, amarelo) como cor de marca — se precisar de um vermelho/verde (ex: pontos "disponível" vs "ocupado" no mapa), usar como cor funcional isolada, não como cor de identidade.

Tipografia

Uma sans-serif geométrica bold para títulos (Poppins, Sora, ou Space Grotesk funcionam bem com esse estilo de logo).
Uma sans-serif mais neutra para corpo de texto (Inter ou Manrope), garantindo legibilidade em fundo escuro.
Textos de destaque/tagline em caixa alta com letter-spacing aberto, replicando o estilo do "CONECTA MARCAS. AMPLIFICA RESULTADOS."

Elementos visuais e UI

Cards e seções com fundo levemente mais claro que o preto puro (
#18181B), bordas sutis, para criar profundidade sem sair do tema escuro.
Usar o próprio ícone (moldura de tela + play) como elemento decorativo recorrente — por exemplo, como "marca d'água" sutil em seções vazias, ou como ícone de loading.
O "+" da marca pode virar um elemento de microinteração: aparece ao lado de números crescentes (contador de cadastros), em botões de "adicionar TV" ou "criar campanha", reforçando a ideia de "mais" em toda a plataforma.
Gráficos, mapas e dashboards (inclusive o painel admin) devem manter o tema escuro com destaques em azul — nada de trocar para fundo branco só no admin, para manter consistência de marca.
Botões primários em azul-gradiente sólido, com hover mais claro; botões secundários em contorno branco/transparente.

Sensação geral que a plataforma deve passar
Profissional, tecnológica, "de bastidores de uma agência/adtech" — não uma plataforma genérica de cadastro. Isso ajuda inclusive na validação: quem visita a landing precisa sentir que está diante de um produto sério, o que aumenta a taxa de conversão nos formulários.
