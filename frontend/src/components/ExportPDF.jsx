// src/components/ExportPDF.jsx
import jsPDF from 'jspdf'

function ExportPDF({ tripData }) {

  const generatePDF = () => {
    const doc = new jsPDF()
    const { city, days, budget, travel_type, itinerary, recommended_restaurant, recommended_hotel, cost_summary, weather } = tripData

    // Couleurs
    const GREEN  = [22, 163, 74]
    const GRAY   = [107, 114, 128]
    const BLACK  = [31, 41, 55]
    const WHITE  = [255, 255, 255]
    const LIGHT  = [249, 250, 251]

    let y = 0

    // ── Header ──────────────────────────────────
    doc.setFillColor(...GREEN)
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(...WHITE)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('TuniGuide AI', 15, 18)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Votre itineraire personnalise en Tunisie', 15, 28)

    doc.setFontSize(10)
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 150, 28)

    y = 50

    // ── Infos voyage ────────────────────────────
    doc.setFillColor(...LIGHT)
    doc.rect(10, y, 190, 35, 'F')
    doc.setDrawColor(...GREEN)
    doc.rect(10, y, 190, 35, 'S')

    doc.setTextColor(...GREEN)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Voyage a ${city}`, 15, y + 10)

    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Duree: ${days} jour(s)`, 15, y + 20)
    doc.text(`Budget: ${budget} DT`, 70, y + 20)
    doc.text(`Type: ${travel_type}`, 130, y + 20)

    if (weather) {
      doc.text(`Meteo: ${weather.temperature}°C - ${weather.description}`, 15, y + 30)
    }

    y += 45

    // ── Itinéraire ──────────────────────────────
    doc.setTextColor(...BLACK)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Itineraire jour par jour', 15, y)
    y += 8

    // Ligne verte
    doc.setDrawColor(...GREEN)
    doc.setLineWidth(0.5)
    doc.line(15, y, 195, y)
    y += 8

    itinerary.forEach((item, index) => {
      // Vérifier si on dépasse la page
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      // Fond alternié
      if (index % 2 === 0) {
        doc.setFillColor(240, 253, 244)
        doc.rect(10, y - 5, 190, 22, 'F')
      }

      // Numéro jour
      doc.setFillColor(...GREEN)
      doc.circle(20, y + 5, 5, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`${item.day}`, index < 9 ? 18 : 17, y + 8)

      // Activité
      doc.setTextColor(...BLACK)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(item.activity || 'Activite', 30, y + 5)

      // Description
      doc.setTextColor(...GRAY)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const desc = (item.description || '').slice(0, 80)
      doc.text(desc, 30, y + 12)

      // Prix
      doc.setTextColor(...GREEN)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      const prix = item.cost === 0 ? 'Gratuit' : `${item.cost} DT`
      doc.text(prix, 170, y + 5)

      // Durée
      doc.setTextColor(...GRAY)
      doc.setFontSize(8)
      doc.text(`${item.duration_hours}h`, 170, y + 12)

      y += 25
    })

    y += 5

    // ── Restaurant + Hôtel ──────────────────────
    if (y > 220) {
      doc.addPage()
      y = 20
    }

    doc.setTextColor(...BLACK)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendations', 15, y)
    y += 8

    doc.setDrawColor(...GREEN)
    doc.line(15, y, 195, y)
    y += 10

    // Restaurant
    if (recommended_restaurant) {
      doc.setFillColor(254, 252, 232)
      doc.rect(10, y, 88, 28, 'F')
      doc.setDrawColor(234, 179, 8)
      doc.rect(10, y, 88, 28, 'S')

      doc.setTextColor(161, 98, 7)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Restaurant recommande', 15, y + 8)

      doc.setTextColor(...BLACK)
      doc.setFontSize(9)
      doc.text(recommended_restaurant.name || '', 15, y + 16)

      doc.setTextColor(...GRAY)
      doc.setFontSize(8)
      doc.text(`${recommended_restaurant.price_per_person} DT/personne`, 15, y + 23)
    }

    // Hôtel
    if (recommended_hotel) {
      doc.setFillColor(239, 246, 255)
      doc.rect(112, y, 88, 28, 'F')
      doc.setDrawColor(59, 130, 246)
      doc.rect(112, y, 88, 28, 'S')

      doc.setTextColor(29, 78, 216)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Hotel recommande', 117, y + 8)

      doc.setTextColor(...BLACK)
      doc.setFontSize(9)
      doc.text(recommended_hotel.name || '', 117, y + 16)

      doc.setTextColor(...GRAY)
      doc.setFontSize(8)
      doc.text(`${recommended_hotel.price_per_night} DT/nuit`, 117, y + 23)
    }

    y += 38

    // ── Résumé budget ───────────────────────────
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    doc.setFillColor(...GREEN)
    doc.rect(10, y, 190, 8, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Resume du budget', 15, y + 6)
    y += 15

    const budgetItems = [
      { label: 'Activites',   value: cost_summary.activities,  color: GREEN },
      { label: 'Hotel',       value: cost_summary.hotel,       color: [37, 99, 235] },
      { label: 'Restaurant',  value: cost_summary.restaurant,  color: [234, 88, 12] },
      { label: 'TOTAL',       value: cost_summary.total,       color: BLACK },
      { label: 'Budget restant', value: cost_summary.remaining_budget, color: cost_summary.remaining_budget >= 0 ? GREEN : [220, 38, 38] },
    ]

    budgetItems.forEach(item => {
      doc.setTextColor(...BLACK)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(item.label, 20, y)

      doc.setTextColor(...item.color)
      doc.setFont('helvetica', 'bold')
      doc.text(`${item.value} DT`, 160, y)

      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.3)
      doc.line(15, y + 3, 195, y + 3)

      y += 10
    })

    // ── Footer ──────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(...GREEN)
      doc.rect(0, 285, 210, 12, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(8)
      doc.text('TuniGuide AI - Votre assistant touristique intelligent en Tunisie', 15, 292)
      doc.text(`Page ${i}/${pageCount}`, 185, 292)
    }

    // Sauvegarder
    doc.save(`TuniGuide-${city}-${days}jours.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      style={{
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      📄 Télécharger PDF
    </button>
  )
}

export default ExportPDF