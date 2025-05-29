# Interaktivni zemljevid Slovenije

Sodobna spletna aplikacija za vizualizacijo občinskih podatkov Slovenije z interaktivnim zemljevidom in naprednimi grafičnimi prikazi.

## 🌟 Funkcionalnosti

- **Interaktivni zemljevid** - Prikaz slovenskih občin z barvnim kodiranjem glede na izbrani parameter
- **Dinamična izbira parametrov** - Možnost izbire med različnimi kategorijami podatkov (prihodki, izobrazba, migracije, zaposlovanje)
- **Časovna analiza** - Prikaz podatkov za različna leta z dinamičnim drsnikom
- **Napredne vizualizacije** - Stolpični in tortni grafikoni ter tabele za podrobno analizo
- **Responsive design** - Prilagojeno za uporabo na vseh napravah
- **Iskanje občin** - Hitro iskanje in navigacija do določene občine
- **Podrobnosti občin** - Klik na občino prikaže podrobne statistike

## 🚀 Tehnologije

### Frontend

- **React 18** - Moderna uporabniška knjižnica
- **TypeScript** - Tipno varno programiranje
- **Tailwind CSS** - Sodoben CSS framework
- **React Query** - Upravljanje stanja in podatkov
- **Leaflet** - Interaktivni zemljevidi
- **Recharts** - Vizualizacija podatkov
- **Shadcn/ui** - Komponente uporabniškega vmesnika

### Backend

- **Node.js** - Serversko okolje
- **Express** - Spletni okvir
- **TypeScript** - Tipno varno programiranje
- **In-memory storage** - Hitro shranjevanje podatkov

## 📊 Podatki

Aplikacija prikazuje različne kategorije podatkov za slovenske občine:

### Prihodki

- Bruto dohodek - SKUPAJ
- Dohodek iz dela
- Starševski, družinski in socialni prejemki
- Pokojnine
- Dohodek iz premoženja, kapitala in drugi

### Izobrazba

- Izobrazba - SKUPAJ
- Terciarna izobrazba
- Srednješolska izobrazba
- Osnovnošolska ali manj

### Migracije

- Indeks delovne migracije
- Indeks delovne migracije - moški
- Indeks delovne migracije - ženske

### Zaposlitev

- Delovno aktivni v občini prebivališča
- Delovno aktivni v občini prebivališča - moški
- Delovno aktivni v občini prebivališča - ženske

## 🌎 Spletni dostop

#### Do online spletne strani lahko dostopate na [OPSI Migracije](https://opsi-migracije-k6v4.onrender.com)

## 🛠️ Lokalna namestitev in zagon

### Predpogoji

- Node.js 20 ali novejši
- npm ali yarn   

### Lokalna namestitev

1. **Kloniraj repozitorij**

```bash
git clone [URL_REPOZITORIJA]
cd interactive-slovenia-map
```

2. **Namesti odvisnosti**

```bash
npm install cross-env --save-dev
```

3. **Zaženi razvojni strežnik**

```bash
npm run build
npm start
```

4. **Odpri aplikacijo**
   Pojdi na `http://localhost:5000` v spletnem brskalniku.

### Docker namestitev

```bash
# Zgradi Docker sliko
docker build -t slovenia-map .

# Zaženi kontejner
docker run -p 5000:5000 slovenia-map
```

## 🎯 Uporaba

1. **Izbira parametra** - V levem meniju izberi kategori in parameter, ki te zanima
2. **Izbira leta** - Uporabi drsnik pod zemljevidom za izbiro leta
3. **Raziskovanje zemljevida** - Klikni na občine za podrobne informacije
4. **Analiza podatkov** - Oglej si grafikone pod zemljevidom za dodatno analizo
5. **Skrivanje menija** - Na mobilnih napravah lahko skriješ levi meni za boljši prikaz

## 🎨 Značilnosti uporabniškega vmesnika

- **Dinamični naslov** - Naslov se spreminja glede na izbrani parameter in leto
- **Barvno kodiranje** - Občine so obarvane glede na vrednosti izbranega parametra
- **Interaktivni elementi** - Hover efekti in tooltips za boljšo uporabniško izkušnjo
- **Mobilna optimizacija** - Odziven dizajn za vse velikosti zaslonov

## 📈 Vizualizacije

Aplikacija ponuja tri vrste vizualizacij:

1. **Stolpični grafikon** - Primerjava vrednosti med občinami
2. **Tortni diagram** - Razdelitev deležev
3. **Tabela** - Podrobni numerični prikaz

Za vsako vizualizacijo lahko izbereš:

- **Najvišji** - Občine z največjimi vrednostmi
- **Najnižji** - Občine z najmanjšimi vrednostmi
- **Okoli mediane** - Občine s povprečnimi vrednostmi

## 🔧 Struktura projekta

```
├── client/                 # Frontend aplikacija
│   ├── src/
│   │   ├── components/     # React komponente
│   │   ├── pages/         # Strani aplikacije
│   │   ├── lib/           # Pomožne funkcije
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend aplikacija
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Upravljanje podatkov
│   └── utils/            # Pomožne funkcije
├── shared/               # Deljeni tipi in sheme
└── attached_assets/      # Podatkovne datoteke
```

## 🤝 Prispevanje

1. Fork repozitorija
2. Ustvari feature branch (`git checkout -b feature/nova-funkcionalnost`)
3. Commit spremembe (`git commit -am 'Dodaj novo funkcionalnost'`)
4. Push na branch (`git push origin feature/nova-funkcionalnost`)
5. Ustvari Pull Request

## 📝 Licenca

Ta projekt je licenciran pod MIT licenco - glej [LICENSE](LICENSE) datoteko za podrobnosti.

## 🙏 Zahvale

- Podatki so pridobljeni iz javnih virov SURS (Statistični urad Republike Slovenije)
- Geografski podatki iz GURS (Geodetska uprava Republike Slovenije)
- Ikone in UI komponente iz Shadcn/ui knjižnice

## 📞 Podpora

Če imaš vprašanja ali predloge za izboljšave, prosim:

- Odpri issue na GitHub repozitoriju
- Kontaktiraj razvojno ekipo

## 📚 Viri

- [Delovne migracije – izbrani kazalniki, občine, Slovenija, letno](https://podatki.gov.si/dataset/surs0772750s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Delovne migracije – občine, Slovenija, letno (nadomestna zbirka)](https://podatki.gov.si/dataset/surs0772755s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Bruto prejeti dohodek prebivalcev, občine, Slovenija, letno](https://podatki.gov.si/dataset/surs0883205s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Bruto prejeti dohodek – občine, Slovenija, letno (nadomestna zbirka)](https://podatki.gov.si/dataset/surs0883203s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Selitveno gibanje prebivalstva, občine, Slovenija, letno](https://podatki.gov.si/dataset/surs05i2002s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Selitveno gibanje – občine, Slovenija, letno (nadomestna zbirka)](https://podatki.gov.si/dataset/surs05i2004s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Prebivalstvo, staro 15 ali več let, po izobrazbi, občine in naselja, Slovenija, letno](https://podatki.gov.si/dataset/surs05g2018s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Skupni prirast prebivalstva, občine, Slovenija, letno](https://podatki.gov.si/dataset/surs05i3002s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Skupni prirast – občine, Slovenija, letno (nadomestna zbirka)](https://podatki.gov.si/dataset/surs05i3004s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Delovno aktivno prebivalstvo – izbrani kazalniki, občine, Slovenija, letno](https://podatki.gov.si/dataset/surs0772815s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

- [Delovno aktivno prebivalstvo – občine, Slovenija, letno (nadomestna zbirka)](https://podatki.gov.si/dataset/surs0772820s)  
  _Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0_

---

**Razvito z ❤️ za Slovenijo** 🇸🇮

# OPSI-Migracije

# Vizualizacija in iskanje po zbirki „OPSI“

    Omejimo se na podatke o migraciji oseb (turistični ali za delo)
    In preseke z njimi!
    Iskanje in prikaz podatkov
    https://podatki.gov.si/
