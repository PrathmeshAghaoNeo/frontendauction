import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0
        })
      ], { optional: true }),

      group([
        query(':enter', [
          animate('40000ms ease-out', style({ opacity: 1 }))
        ], { optional: true }),

        query(':leave', [
          animate('2000ms ease-in', style({ opacity: 0 }))
        ], { optional: true })
      ])
    ])
  ]);
