from random import choice
import pandas as pd

nfts = []
for i in range(1000):
    attributes = []
    attack = (i + 314) % 100
    defense = (i + 72) % 100
    money = (i + 39298) % 100
    # now according to probability
    attackMultiplier = 10
    defenseMultiplier = 10
    moneyMultiplier = 10
    if attack >= 95:
        # goliath
        attackMultiplier += 6 * (attack - 95) # 3 times
        attributes.append("goliath")
    elif attack >= 80:
        # lion
        attackMultiplier += attack - 80 # 2 times
        attributes.append("lion")
    elif 20 <= attack <= 30:
        attackMultiplier += attack - 15 # 1.5 time
        attributes.append("underdog")
    # defense
    if defense > 95:
        # goliath
        defenseMultiplier += 6 * (defense - 95) # 3 times
        attributes.append("steelbuddy")
    elif defense > 80:
        defenseMultiplier += defense - 80 # 2 times
        attributes.append("turtle")
    # money multiplier
    if money >= 95:
        # goliath
        moneyMultiplier += 6 * (money - 95) # 3 times
        attributes.append("bill gaytes")
    elif money >= 80:
        # lion
        moneyMultiplier += money - 80 # 2 times
        attributes.append("mr cash")
    else:
        moneyMultiplier += money / 10
    
    nfts.append([attackMultiplier, defenseMultiplier, moneyMultiplier, attributes])
    
df = pd.DataFrame(nfts, columns=["attack", "defense", "money", "attributes"])
print(df.head())
for col in ["attack", "defense", "money"]:
    print(col, df[col].value_counts())
        