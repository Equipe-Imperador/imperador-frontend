<div align="center">
  
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1b2a,50:8B6914,100:C9A84C&height=180&section=header&text=Imperador%20Frontend&fontSize=40&fontColor=ffffff&fontAlignY=38&desc=Real-Time%20Telemetry%20Dashboard%20%7C%20Baja%20SAE%20Imperador&descAlignY=58&descSize=16&animation=fadeIn" width="100%"/>
  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

</div>

---

## 🖥️ Sobre o Projeto

O **Imperador Frontend** é o dashboard de telemetria em tempo real do veículo Baja SAE da Equipe Imperador. Conectado ao [imperador-backend](https://github.com/Equipe-Imperador/imperador-backend) via **WebSocket**, exibe dados críticos do veículo durante a competição e permite que a equipe de apoio envie comandos de controle remotamente.

---

## 🏎️ Funcionalidades

### Monitoramento em Tempo Real
| Dado | Criticidade |
|------|-------------|
| 🚀 Velocidade | Alta |
| 🔄 RPM do motor | Alta |
| 🌡️ Temperatura da CVT | **Crítica** |
| 📊 Demais dados do veículo | Média |

### Controles Remotos
- 📯 **Buzina** — aciona o buzzer embarcado no veículo
- ⚙️ **Diferencial** — habilita/desabilita o diferencial remotamente
- 🏁 **Chamada de Box** — envia sinal que altera a tela do display **DWIN** embarcado no painel do piloto para a tela de pit stop

---

## 🔗 Comunicação

```
Dashboard (React) ──WebSocket──► Backend (Node.js) ──MQTT──► MECU (C++)
                                                              │
                                                         DWIN Display
```

O frontend se comunica **exclusivamente via WebSocket** com o backend, que abstrai toda a complexidade da camada MQTT e da comunicação com o hardware embarcado.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|-----------|-----|
| React 18 | Framework de UI |
| TypeScript | Tipagem estática |
| Vite | Bundler e dev server |
| WebSocket (nativo) | Comunicação em tempo real |
| ESLint | Qualidade de código |

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- [imperador-backend](https://github.com/Equipe-Imperador/imperador-backend) rodando

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Equipe-Imperador/imperador-frontend.git
cd imperador-frontend

# Instale as dependências
npm install

# Configure o endereço do backend
# Edite src/config.ts com o IP do servidor
```

### Executar

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm run preview
```

---

## 🔌 Integração com o Sistema Embarcado

Este dashboard faz parte de um ecossistema maior de eletrônica embarcada desenvolvido pela Equipe Imperador:

- **MECU** — Main ECU (C++) → publica dados via MQTT
- **FECU** — Front ECU (C++) → controle de freio
- **RECU** — Rear ECU (C++) → proteção e segurança
- **PTECU** — Powertrain ECU (C++) → controle de powertrain
- **Display DWIN** — painel do piloto, controlado via serial

---

## 👥 Equipe

Desenvolvido pela **Equipe Imperador Baja SAE — UTFPR Curitiba**

Subsistema de Eletrônica Embarcada

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:e96c00,100:1a1a2e&height=100&section=footer" width="100%"/>

</div>
