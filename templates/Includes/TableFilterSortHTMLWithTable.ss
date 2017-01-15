<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <title>$Title</title>
</head>

<body>
    <a class="simplemodal-close" href="javascript:parent.closeIFrame();">Close</a>

<% if $AddForm %>

    $AddForm

<% else %>
    <div class="tableFilterSortHolder">
    <% include TableFilterSortHeader %>

    <% include TableFilterSortTable %>

    <% include TableFilterSortFooter %>
    </div>
<% end_if %>

</body>
</html>
