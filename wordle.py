ans = "bench"

def check_guess(ans):
    for i in range(2):
        print("Current attempt:", i + 1)
        guess = input("Enter your guess: ")
        temp = [0, 0, 0, 0, 0]
        exist = [0, 0, 0, 0, 0]

        count = 0
        for k in range(5):
            if guess[k] == ans[k]:
                temp[k] = 2
                exist[k] = 1
                count += 1

        for k in range(5):
            if temp[k] == 0:
                for t in range(5):
                    if guess[k] == ans[t] and exist[t] == 0:
                        temp[k] = 1
                        exist[t] = 1

        for k in range(5):
            if temp[k] == 2:
                print("🟩", end="")
            elif temp[k] == 1:
                print("🟨", end="")
            else:
                print("⬜", end="")

        print()
        
        if count == 5:
            print("Yay you guessed the word!")
            break

check_guess("bench")

                