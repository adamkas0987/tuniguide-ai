import { useState, useRef, useEffect } from 'react'
import { chatWithAgent } from '../services/api'

function ChatWidget({ tripData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis TuniGuide AI 🗺️\nJe connais votre voyage à ${tripData?.city}.\nPosez-moi n'importe quelle question !`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const tripContext = tripData ? {
        city:        tripData.city,
        days:        tripData.days,
        budget:      tripData.budget,
        travel_type: tripData.travel_type,
        itinerary:   tripData.itinerary
      } : null

      const response = await chatWithAgent(userMessage, history, tripContext)
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, je rencontre un problème. Réessayez dans quelques secondes.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#16a34a',
          color: 'white',
          fontSize: '28px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Fenêtre chat */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          border: '1px solid #e5e7eb'
        }}>

          {/* Header */}
          <div style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>🤖 TuniGuide AI</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Assistant touristique • {tripData?.city}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#16a34a' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#1f2937',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: '13px'
                }}>
                  ⏳ TuniGuide réfléchit...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div style={{
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            borderTop: '1px solid #f3f4f6'
          }}>
            {['🔒 Lieu fermé ?', '🍽️ Restaurant ?', '🌧️ Il pleut ?', '💰 Gratuit ?'].map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              disabled={loading}
              style={{
                flex: 1,
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: loading || !input.trim() ? '#d1d5db' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 14px',
                fontSize: '13px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget