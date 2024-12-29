# Affichage des données du fichier iris.csv
import matplotlib.pyplot as plt
import pandas

donnees = pandas. read_csv ('iris.csv', header =0)	# lecture du fichier iris.csv

setosa = donnees[donnees['espece'] == 'setosa']		# setosa contiendra la liste des meures de toutes les espèces d'iris 'setosa'
plt . scatter ( setosa ['long_sepale'], setosa ['larg_sepale'],color='g', label ='setosa')	# abscisse : long_petale, ordonnée : larg_petale , color green

plt.xlabel ('longeur sepale')	# affichage des label
plt.ylabel ('largeur sepale')
plt.title ('Iris')		# titre
plt.legend ();			# légende des label
plt.show() 			# affiche le graphique