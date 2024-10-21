/*
** EPITECH PROJECT, 2023
** my_getnbr
** File description:
** return a number sent to the fonction string
*/

int my_put_nbr(int nb)
{
    int i = 1000000000;
    int var = 0;
    int j;

    if (nb < 0) {
        nb = nb * (- 1);
        my_putchar('-');
    }
    while (nb < i ){
        i = i / 10 ;
    }
    while (i != 0) {
        if ( nb / i >= 0) {
            var = nb / i;
            my_putchar(var + 48);
            nb -= i * var;
        }
        i = i / 10;
    }
}
