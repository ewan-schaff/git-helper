#########################################
# Programme écrit par Prénom Nom Classe #
#########################################
import pygame,sys
from pygame.locals import *
import random, pickle, socket

pygame.init()
pygame.font.init()
fenetre_jeu=pygame.display.set_mode((450,560))        # Taille fenêtre du jeu en pixels
pygame.display.set_caption('SpaceInvader')            # titre de la fenêtre

#############################
# Déclaration des variables #
#############################

max_missiles=7

i=0
score_serveur=0
score_client=0
missiles=[]
missiles_aliens=[]
Gauche = False
Droite = False
Haut = False
bas = False
Texty = pygame.font.Font('SUPERPOI_R.TTF', 10)
Obj_texte = Texty.render('les envahisseurs', 0, (0,0,255))
clock = pygame.time.Clock()
vaisseau = pygame.image.load('vaiseau.png')
img_aliens=[pygame.image.load('aliens.png'),pygame.image.load('aliens2.png')]
rectangle_vaisseau = pygame.Rect(20,500,31,32)
rectangle_alien = pygame.Rect(30,50,31,32)
score_serveurs = Texty.render("Vaisseau : "+str(score_serveur),0,(255,255,255))
score_clients = Texty.render("Alien : "+str(score_client),0,(255,255,255))

#####################################
#            Fonctions              #
#####################################

def detecte_touches(role):
    """ Cette fonction permet de détecter les touches enfoncées ou relâchées
    de quitter le jeu ou de permettre le déplacement du vaisseau"""

    global Gauche,Droite,Haut,bas

    for event in pygame.event.get():
        if event.type==QUIT:        # Traite l'évènement fermer la fenêtre avec la souris
                pygame.quit()
                sys.exit()
        if event.type== KEYDOWN:    # Traiter les évènements du clavier
            if event.key==K_ESCAPE:
                pygame.quit()
                sys.exit()
            if event.key==K_RIGHT:
                Droite = True
            if event.key==K_LEFT:
                Gauche = True
            if event.key==K_UP:
                Haut = True
            if event.key==K_DOWN:
                bas = True
            if event.key==K_SPACE and role=='s':
                if len(missiles)<max_missiles:
                    missiles.append(pygame.Rect(rectangle_vaisseau.left+12,rectangle_vaisseau.top,6,16))
            if event.key==K_SPACE and role=='c':
                if len(missiles_aliens)<max_missiles:
                    missiles_aliens.append(pygame.Rect(rectangle_alien.left+12,rectangle_alien.bottom,6,16))
        if event.type== KEYUP:
            if event.key==K_RIGHT:
                Droite = False
            if event.key==K_LEFT:
                Gauche = False
            if event.key==K_UP:
                Haut = False
            if event.key==K_DOWN:
                bas = False

def deplace_missiles():
    """ Cette fonction permet de changer les coordonnées des missiles contenu dans la liste missiles"""
    for missile in missiles:                # pour chaque missiles existant
        missile.top=missile.top-10            # soustraire 10 à la coordonnée du point haut
        pygame.draw.rect(fenetre_jeu,0xFF0000,missile)    # dessinner un rectangle de couleur rouge
        if missile.top==50:                # si le missiles arrive en haut de l'écran
            missiles.remove(missile)            # supprimer le missiles de la liste



def detecte_collision():
    """Cette fonction détecte une collision entre un missile et un alien
        puis supprime les deux éléments de la liste"""
    global score_serveur,score_client,score_serveurs,score_serveur,score_clients
    for missile in missiles:
            if missile.colliderect(rectangle_alien):
                missiles.remove(missile)
                score_serveur+=1
                print ('serveur : ',score_serveur, 'client : ', score_client)
                score_serveurs = Texty.render(" Vaisseau : "+str(score_serveur), 0, (255,255,255))

def deplace_missiles_aliens():
    """ Cette fonction permet de changer les coordonnées des missiles contenu dans la liste missiles"""
    for missile in missiles_aliens:                # pour chaque missiles existant
        missile.top=missile.top+10            # soustraire 10 à la coordonnée du point haut
        pygame.draw.rect(fenetre_jeu,0x00FF00,missile)    # dessinner un rectangle de couleur rouge
        if missile.top>=550:                # si le missiles arrive en haut de l'écran
            missiles_aliens.remove(missile)            # supprimer le missiles de la liste


def detecte_collision_vaisseau():
    global score_client,score_serveur,score_clients,score_client,score_serveurs
    for missile in missiles_aliens:
        if rectangle_vaisseau.colliderect(missile):
            missiles_aliens.remove(missile)
            score_client+=1
            print('serveur : ',score_serveur,'client : ', score_client)
            score_clients = Texty.render(" Alien : "+str(score_client), 0, (255,255,255))


def fin_du_jeu():
    global n


def menu():
    global role
    c=0
    global n,Droite,Gauche, score
    fenetre_jeu.fill(25)
    while True:
        fenetre_jeu.blit(Texty.render('Space Invader - LE DUEL : ',0,(255,c,0)),(100,250))
        fenetre_jeu.blit(Texty.render('appuyer sur s : serveur c : client',0,(255,c,0)),(50,320))
        pygame.display.update()
        clock.tick(60)
        c+=15
        if c>=255: c=0
        for event in pygame.event.get():
            if event.type==QUIT:        # Traite l'évènement fermer la fenêtre avec la souris
                    pygame.quit()
                    sys.exit()
            if event.type== KEYDOWN:    # Traiter les évènements du clavier
                if event.key==K_ESCAPE:
                    pygame.quit()
                    sys.exit()

                if event.key==K_s:
                   return 's'
                if event.key==K_c:
                   return 'c'



def connexion(role):
    import socket
    if role =='s':
        #Implanter le code de connexion du serveur
        port = 50000
        IP = socket.gethostbyname(socket.gethostname())            # Récupère l'adresse IP
        print("Connceter le client à l'adresse IP : ", IP, " et le PORT : ", port)
        socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)      # Déclaration de la connexion réseau
        socket.bind((IP,port))                        # Créer le lien réseau
        socket.listen(5)                                                # Ecoute le réseau
        client, adresse = socket.accept()                               # Attend la connexion d'un client
        print ("adresse IP adresse client : ", adresse[0])
        print ("PORT Client : ", adresse[1])
        return(client)
    else:
    #implanter le code de connexion du client
               hote = "10.129.0.225"#input("Saisir l'adresse IP du serveur : ")           # Adresse IP du serveur
               port = 50000 #int(input("Saisir le PORT du serveur : "))           # Port du serveur

               serveur = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # Déclaration de la connexion réseau
               serveur.connect((hote, port))                                # Etablir la connexion avec le serveur
               print ("Connecté au port ",port)





    return(serveur)


 ####################
 # SCRIPT PRINCIPAL #
 ####################


role=menu()

if role=='s':
    client=connexion(role)
    pygame.display.set_caption('SpaceInvader SERVEUR')              # titre de la fenêtre

else:
    serveur=connexion(role)
    pygame.display.set_caption('SpaceInvader CLIENT')              # titre de la fenêtre


while True:
    fenetre_jeu.fill (0x00001A)        # Remplir l'arrieère plan avec la couleur RVB Bleu foncé
    fenetre_jeu.blit(Obj_texte,(50,20))            # Placer le texte
    fenetre_jeu.blit(vaisseau,rectangle_vaisseau)    # placer l'image
    fenetre_jeu.blit(img_aliens[(i//15)%2],rectangle_alien)    # placer l'alien

    detecte_touches(role)

    fenetre_jeu.blit(score_clients,(10,280))
    fenetre_jeu.blit(score_serveurs,(310,280))

# Déplacement du vaisseau ou de l'alien de 5 pixels
    if role =='s':
          if Gauche and rectangle_vaisseau.left > 10 : rectangle_vaisseau.left -= 5
          if Droite and rectangle_vaisseau.right < 440 : rectangle_vaisseau.right += 5
          if Haut and rectangle_vaisseau.top > 310 :rectangle_vaisseau.top -=5
          if bas and rectangle_vaisseau.bottom < 550 : rectangle_vaisseau.bottom +=5
          donnees_serveur={"Coordonnees":rectangle_vaisseau,"Missiles":missiles,"Score":score_serveur}
          donnees=pickle.dumps(donnees_serveur)
          client.send(donnees)
          msgClient = client.recv(1024)
          msgClient = pickle.loads(msgClient)
          rectangle_alien=msgClient['Coordonnees']
          missiles_aliens=msgClient['Missiles']
          score_client=msgClient['Score']

    else:
         if Gauche and rectangle_alien.left > 10 : rectangle_alien.left -= 5
         if Droite and rectangle_alien.right < 440 : rectangle_alien.right += 5
         if Haut and rectangle_alien.top > 10 : rectangle_alien.top -=5
         if bas and rectangle_alien.bottom < 260 : rectangle_alien.bottom +=5
         donnees_client ={"Coordonnees":rectangle_alien,"Missiles":missiles_aliens,"Score":score_client}
         donnees=pickle.dumps(donnees_client)
         msgServeur=serveur.recv(1024)
         msgServeur=pickle.loads(msgServeur)
         serveur.send(donnees)
         rectangle_vaisseau=msgServeur['Coordonnees']
         missiles=msgServeur['Missiles']
         score_serveur=msgServeur['Score']





    detecte_collision()
    detecte_collision_vaisseau()

    i+=1
    deplace_missiles()
    deplace_missiles_aliens()

    pygame.display.update()                # rafraichir l'affichage de la fenêtre jeu
    clock.tick(30)                    # Vitesse du jeu : 30 FPS