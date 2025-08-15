# Shopping list

- In the header there should be a "Shoppinglists" link
- This page should display:
  - Button to create a new shoppinglist
  - All shoppinglists of the user as large cards with all ingrediants
- To create a new shoppinglist the user needs to select start- (default: current date) and enddate (current date + 7 days) and can create the shoppinglist 
- To create it, all ingrediants get selected of all menues in the range of the start- and enddate and stored in a shoppinglists table, every entry have also a checked boolean created with false
- The shoppinglist card should display all ingrediants and a checkbox for each one. If the user check it, the ingrediants get streight through and the check boolean get stored in database
- The shoppinglist card also have a delete icon to delete it
- The quick actions section in the calendar should be removed
