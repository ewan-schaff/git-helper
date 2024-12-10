/*
** EPITECH PROJECT, 2023
** my_strlen
** File description:
** display the number of character found in the string
*/

int my_strlen( char const *str)
{
    int i = 0;

    while (str[i] != '\0'){
        i++;
    }
    return (i);
}
