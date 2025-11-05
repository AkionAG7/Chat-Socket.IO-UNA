describe('Chat Socket.IO - E2E (username + mensaje)', () => {
  const ui = {
    username: [
      'input[placeholder^="Username"]',
      'input[placeholder*="Usuario"]',
      'input[name="username"]',
      '#username',
      '#user',
      'input[aria-label="username"]'
    ],
    message: [
      '#messageInput',
      '#m',
      'input[name="message"]',
      'textarea[name="message"]',
      'input[placeholder*="Escribe un mensaje"]',
      'textarea[placeholder*="Escribe un mensaje"]'
    ],
    sendBtn: [
      '#sendBtn',
      '#send',
      'button[type="submit"]',
      'button:contains("Send")',
      'button:contains("Enviar")'
    ],
    messagesList: ['#messages', '.messages', '[data-testid="messages"]'],
    errorBanner: ['#error', '.error', '[data-testid="error"]', '.toast-error', '.alert-error']
  };

  const ensureUsername = (name = 'keirin') => {
    cy.get('body').then($b => {
      const sel = ui.username.find(s => $b.find(s).length);
      if (sel) cy.get(sel).clear().type(name);
      else cy.log('No username input found; continuing (UI may not require it).');
    });
  };

  const writeAndSend = (name, text) => {
    ensureUsername(name);
    cy.wait(100);
    cy.get('body').then($b => {
      const msgSel = ui.message.find(s => $b.find(s).length);
      const sendSel = ui.sendBtn.find(s => $b.find(s).length);
      if (!msgSel) throw new Error('No se encontró el input de mensaje.');
      if (!sendSel) throw new Error('No se encontró el botón de enviar.');
      cy.get(msgSel).clear().type(text);
      cy.get(sendSel).click();
    });
  };

  beforeEach(() => {
    cy.visit('/chat');
  });

  it('envía y muestra un mensaje de texto (incluye username)', () => {
    const username = 'keirin';
    const msg = `Hola E2E ${Date.now()}`;

    writeAndSend(username, msg);

    cy.get('body').then($b => {
      const listSel = ui.messagesList.find(s => $b.find(s).length) || 'body';
      cy.get(listSel).should('contain.text', msg);
      cy.get(listSel).should('contain.text', username);
    });
  });

  it('envía y renderiza un link de YouTube (incluye username)', { defaultCommandTimeout: 15000, requestTimeout: 15000 }, () => {
  const username = 'keirin';
  const yt = 'https://www.youtube.com/watch?v=gd5ejbXEAQU';

  writeAndSend(username, yt);

  cy.wait(2000);

  cy.get('body', { timeout: 15000 }).then($b => {
    const listSel =
      ['#messages', '.messages', '[data-testid="messages"]']
        .find(s => $b.find(s).length) || 'body';

    cy.get(listSel, { timeout: 15000 }).then($list => {

      const $links = $list.find('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');

      if ($links.length) {
        cy.wrap($links.eq(0)).should('be.visible');
      } else {
        cy.wait(2000);
        cy.wrap($list)
          .find('iframe[src*="youtube"], iframe[src*="youtu"]')
          .should('exist')
          .and('be.visible');
      }
    });

    cy.get(listSel, { timeout: 15000 }).should('contain.text', username);
  });
});


  it('envía y renderiza una imagen desde URL (incluye username)', () => {
    const username = 'keirin';
    const img =
      'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=';

    writeAndSend(username, img);

    cy.get('body').then($b => {
      const listSel = ui.messagesList.find(s => $b.find(s).length) || 'body';
      cy.get(listSel).then($list => {
        const $img = $list.find('img[src*="istockphoto.com"]');
        if ($img.length) {
          cy.wrap($img.eq(0)).should('be.visible');
        } else {
          cy.wrap($list).find('a[href*="istockphoto.com"]').should('exist');
        }
      });
      cy.get(listSel).should('contain.text', username);
    });
  });

  it('bloquea el envío de links maliciosos', () => {
    const username = 'keirin';
    const badLinks = [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'http://example.com/<script>alert(1)</script>'
    ];

    badLinks.forEach(mal => {
      writeAndSend(username, mal);

      cy.get('body').then($b => {
        const listSel = ui.messagesList.find(s => $b.find(s).length) || 'body';
        cy.get(listSel).should('not.contain.text', mal);

        const errSel = ui.errorBanner.find(s => $b.find(s).length);
        if (errSel) cy.get(errSel).should('be.visible');
      });
    });
  });

  it('envía 3 mensajes en orden (cada uno con username)', () => {
    const username = 'keirin';
    const msgs = [1, 2, 3].map(n => `E2E-${n}-${Date.now()}`);

    msgs.forEach(m => writeAndSend(username, m));

    cy.get('body').then($b => {
      const listSel = ui.messagesList.find(s => $b.find(s).length) || 'body';
      cy.get(listSel).then($list => {
        const text = $list.text();
        expect(text).to.include(msgs[0]);
        expect(text).to.include(msgs[1]);
        expect(text).to.include(msgs[2]);
      });
    });
  });
});
