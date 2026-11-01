        <section className="intro">
          <h1 className="intro-title">
            AI & Tech, <span className="gradient-text">curated for busy professionals</span>
          </h1>
          <p className="intro-sub">
            The most important stories for engineers, product managers, and founders — in 5 minutes.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
            Built in India. Read worldwide.
          </p>

          {/* Top Subscribe Form */}
          <div style={{ marginTop: '24px', maxWidth: '480px' }}>
            {subStatus.type === 'success' ? (
              <div className="subscribe-success" style={{ margin: 0 }}>
                {subStatus.message}
              </div>
            ) : (
              <form 
                className="subscribe-form" 
                onSubmit={handleSubscribe} 
                style={{ margin: 0, justifyContent: 'flex-start' }}
              >
                <input 
                  name="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  className="subscribe-input"
                  disabled={subStatus.type === 'loading'}
                />
                <button 
                  type="submit" 
                  className="subscribe-button"
                  disabled={subStatus.type === 'loading'}
                >
                  {subStatus.type === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            {subStatus.type === 'error' && (
              <p className="subscribe-error">{subStatus.message}</p>
            )}
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
              Get the daily AI pulse in your inbox. No spam.
            </p>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>I am a:</span>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--border)', padding: '4px', borderRadius: '12px' }}>
              {[
                { id: 'engineer', label: 'Engineer' },
                { id: 'pm', label: 'Product Manager' },
                { id: 'founder', label: 'Founder' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: role === r.id ? 'var(--bg)' : 'transparent',
                    color: role === r.id ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: role === r.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>
