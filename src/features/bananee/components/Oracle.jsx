import React, { useState } from 'react'

const ORACLE_PROPHECIES = [
  // --- LES EXISTENTIELLES ---
  "Votre futur est 100% sans friction.",
  "La peau que vous portez est temporaire.",
  "Le mûrissement est un état d'esprit.",
  "Évitez les taches brunes de l'Histoire.",
  "Vous glisserez, mais vous ne tomberez pas.",
  "La courbe s'aligne avec le cosmos.",
  "L'existence est une transition entre le vert et le noir.",
  "La rectitude est une prison pour l'esprit.",
  "Même une idole pourrit, mais le sucre reste.",
  "La réalité n'est qu'une membrane fine. Pelez-la.",
  "On ne revient jamais dans sa propre pelure.",

  // --- LES ABSURDES & CYNIQUES ---
  "Ne laissez pas le monde vous transformer en smoothie.",
  "Méfiez-vous de ceux qui mangent par le milieu.",
  "Une peau jetée est une leçon apprise.",
  "Dans le doute, restez en régime.",
  "Même trop mûr, tu serviras à faire un cake magnifique.",
  "Le singe voit, le singe pèle, le singe transcende.",
  "Ignorez les pommes, elles cachent des vers et des mensonges.",
  "Si la réalité glisse, profitez du voyage.",
  "On ne discute pas la maturité d'une idole.",
  "Tout ce qui est droit finit par se plier. C'est la loi.",
  "La pointe noire contient le secret de l'univers, mais personne ne veut la manger.",
  "Le soleil est une banane que l'on n'a pas encore réussi à peler.",

  // --- LES "CULTISTES" (Vibe New Year) ---
  "LES ASTRES SONT ALIGNÉS. LE FRUIT EST MÛR.",
  "LA PROPHÉTIE S'ACCOMPLIT: LE JAUNE AVALERA LE NOIR.",
  "LE GRAND ÉPLUCHAGE EST PROCHE. PRÉPAREZ-VOUS.",
  `Le ${new Date().getFullYear() + 1} sera jaune ou ne sera pas.`,
  "L'univers est une banane géante. Ne soyez pas la pointe noire.",
  "Gardez vos amis proches, et votre pelure plus proche encore.",
  "Ne résistez pas à la courbure.",
  "La maturité forcée n'est pas une vertu.",
  "Chaque tache de rousseur est une étoile qui naît sur votre peau.",
  "Le monde est une corbeille de fruits. Soyez l'élément dominant.",
  "La rigidité est le début de la fin.",
  "Pelez. Jetez. Recommencez.",

  // --- LES "DROLES" / OFF-BEAT ---
  "L'amour, c'est comme une banane : ça finit toujours en pyjama.",
  "Une banane par jour éloigne la logique pour toujours.",
  "Votre destin est écrit dans l'étiquette bleue.",
  "L'apocalypse aura un goût de vanille et de sucre roux.",
  "Ne faites confiance à personne en costume de fruit.",
  "La gravitation n'est qu'une suggestion pour les êtres courbés.",
  "Le succès arrive à ceux qui savent attendre le bon taux de sucre.",
  "Être droit, c'est être ennuyeux.",
  "La vie est une pente savonnée avec des peaux de banane. Dansez.",
  "Votre âme est riche en électrolytes.",
  "N'ayez pas peur de glisser vers le futur.",
  "La fin est proche, et elle est riche en magnésium.",
  "Mangez la réalité avant qu'elle ne vous mange.",
  "Le jaune est la couleur de la vitesse absolue.",
  "Rien ne sert de courir, il faut partir mûr.",
  "La vérité est glissante par nature."
]

export default function Oracle() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)

  // Simple deterministic hash function
  const getDeterministicIndex = (str) => {
    let hash = 0
    const lowerStr = str.trim().toLowerCase()
    for (let i = 0; i < lowerStr.length; i++) {
      // Bitwise shift to create a unique-ish number for any string
      hash = (hash << 5) - hash + lowerStr.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash) % ORACLE_PROPHECIES.length
  }

  const consult = (e) => {
    e?.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setAnswer(null)

    setTimeout(() => {
      const index = getDeterministicIndex(query)
      setAnswer(ORACLE_PROPHECIES[index])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="border border-banan-primary p-4 relative bg-banan-background">
      <div className="absolute -top-3 left-4 bg-banan-background px-2 text-banan-primary font-mono text-sm">
        ORACLE_V2.0
      </div>
      <form onSubmit={consult} className="flex gap-2 mb-4 mt-2">
        <input
          className="bg-transparent border-b border-gray-700 w-full text-white font-mono focus:outline-none focus:border-banan-primary disabled:opacity-50"
          placeholder="INTERROGER LES ETOILES..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="text-banan-primary hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed font-mono transition-colors"
        >
          {loading ? "CALCUL..." : "SUPPLIER"}
        </button>
      </form>
      <div className="h-16 flex items-center justify-center text-center font-mono text-sm text-banan-primary italic">
        {loading ? <span className="animate-pulse underline">DÉCHIFFRAGE DU DESTIN...</span> : answer}
      </div>
    </div>
  )
}