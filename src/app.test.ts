import { from, map } from 'rxjs'

test('the observable interval emits 100 then 200 then 300', done => {
        let last: number = 100;
        from([100, 200, 300])
        .pipe(map((x: number) => {
            console.log(x)
            return x
        }))
        .subscribe({
            next: val => {
                expect(val).toBe(last)
                last += 100
              },
            complete: () => done(),
        })
            
})