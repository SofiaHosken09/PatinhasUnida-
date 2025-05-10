 document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const uid = user.uid;

        // Buscar dados do usuário
        firebase.firestore().collection('usuarios').doc(uid).get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();
              document.getElementById('user-name').textContent = data.nome;
              document.getElementById('user-photo').src = data.fotoURL || 'img/default-profile.png';
            }
          });

        // Buscar pets cadastrados pelo usuário
        firebase.firestore().collection('pets')
          .where('uid', '==', uid)
          .get()
          .then(snapshot => {
            const container = document.querySelector('.cards-container');
            container.innerHTML = ''; // limpa os cards de exemplo

            snapshot.forEach(doc => {
              const pet = doc.data();
              const card = document.createElement('div');
              card.className = 'card';
              card.innerHTML = `
                <img src="${pet.fotoURL || 'img/pet-default.jpg'}" alt="${pet.nome}" />
                <div class="card-info">
                  <h3>${pet.nome}</h3>
                  <p>${pet.descricao}</p>
                  <button data-id="${doc.id}">Adotado?</button>
                </div>
              `;
              container.appendChild(card);
            });

            // Evento de "Adotado?" nos novos cards
            document.querySelectorAll('.card button').forEach(btn => {
              btn.addEventListener('click', () => {
                const petId = btn.dataset.id;
                if (confirm(`Marcar o animal "${petId}" como adotado?`)) {
                  firebase.firestore().collection('pets').doc(petId).update({ adotado: true })
                    .then(() => {
                      alert(`Animal ${petId} marcado como adotado.`);
                      btn.disabled = true;
                      btn.textContent = 'Adotado ✅';
                    });
                }
              });
            });
          });

      } else {
        // se não estiver logado, redireciona para login
        window.location.href = 'login.html';
     }
         });
  });


