<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <title>$Title</title>
</head>

<body id="tfs-modal-pop-up">
    <div id="wrapper">
<% if $AddForm %>

    $AddForm

<% else_if $ShareLink  %>

<% else %>
    <div class="tableFilterSortHolder">
    <% include TableFilterSortHeader %>

    <% include TableFilterSortTable %>

    <% include TableFilterSortFooter %>
    </div>
<% end_if %>
    </div>
</body>
</html>
